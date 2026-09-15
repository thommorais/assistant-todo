package services

import (
	"context"
	"strings"

	"folio/folio-core/domain"
	"folio/folio-core/domain/rules"
	"folio/folio-core/ports"
)

// Paging bounds. The work log is the project's memory and grows without
// bound, so every listing is clamped: an unbounded read would eventually time
// out or blow a context window.
const (
	DefaultPageSize = 50
	MaxPageSize     = 500
)

// clampLimit applies the default when unset and the ceiling when over.
func clampLimit(limit int) int {
	if limit <= 0 {
		return DefaultPageSize
	}
	if limit > MaxPageSize {
		return MaxPageSize
	}
	return limit
}

// JournalService manages the work log: titled, searchable entries describing what
// was built, how, and where it stands.
type JournalService struct {
	repo    ports.JournalRepository
	tickets ports.TicketRepository
	guard   ports.Guard
	clock   ports.Clock
	ids     ports.IDGenerator
	log     ports.Logger
}

func NewJournalService(repo ports.JournalRepository, tickets ports.TicketRepository, guard ports.Guard, clock ports.Clock, ids ports.IDGenerator, log ports.Logger) *JournalService {
	return &JournalService{repo: repo, tickets: tickets, guard: guard, clock: clock, ids: ids, log: log}
}

var _ ports.JournalUseCase = (*JournalService)(nil)

func (s *JournalService) ListJournal(ctx context.Context, actor ports.Actor, project domain.ProjectID, f domain.JournalFilter) ([]domain.JournalEntry, error) {
	if _, err := s.guard.EnsureRead(ctx, actor, project); err != nil {
		return nil, err
	}
	f.Limit = clampLimit(f.Limit)
	entries, err := s.repo.List(ctx, project, f)
	if err != nil {
		return nil, err
	}
	if entries == nil {
		entries = []domain.JournalEntry{}
	}
	return entries, nil
}

func (s *JournalService) GetJournalEntry(ctx context.Context, actor ports.Actor, id domain.JournalID) (domain.JournalEntry, error) {
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.JournalEntry{}, err
	}
	if _, err := s.guard.EnsureRead(ctx, actor, entry.ProjectID); err != nil {
		return domain.JournalEntry{}, err
	}
	return entry, nil
}

func (s *JournalService) WriteJournalEntry(ctx context.Context, actor ports.Actor, in ports.WriteJournalInput) (domain.JournalEntry, error) {
	if _, err := s.guard.EnsureWrite(ctx, actor, in.ProjectID); err != nil {
		return domain.JournalEntry{}, err
	}

	if err := ticketScope(ctx, s.tickets, in.TicketID, in.ProjectID); err != nil {
		return domain.JournalEntry{}, err
	}

	now := s.clock.Now()
	entry := domain.JournalEntry{
		ID:          domain.JournalID(s.ids.NewID()),
		ProjectID:   in.ProjectID,
		TicketID:    in.TicketID,
		PlanID:      in.PlanID,
		TodoID:      in.TodoID,
		Title:       strings.TrimSpace(in.Title),
		Body:        in.Body,
		Branch:      strings.TrimSpace(in.Branch),
		PR:          strings.TrimSpace(in.PR),
		ExternalRef: strings.TrimSpace(in.ExternalRef),
		Tags:        in.Tags,
		Meta:        in.Meta,
		CreatedBy:   actor.UserID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if err := rules.ValidateJournalEntry(entry); err != nil {
		return domain.JournalEntry{}, err
	}
	return s.repo.Create(ctx, entry)
}

func (s *JournalService) UpdateJournalEntry(ctx context.Context, actor ports.Actor, id domain.JournalID, in ports.UpdateJournalInput) (domain.JournalEntry, error) {
	entry, err := s.writable(ctx, actor, id)
	if err != nil {
		return domain.JournalEntry{}, err
	}

	if in.TicketID != nil {
		if err := ticketScope(ctx, s.tickets, *in.TicketID, entry.ProjectID); err != nil {
			return domain.JournalEntry{}, err
		}
		entry.TicketID = *in.TicketID
	}
	if in.PlanID != nil {
		entry.PlanID = *in.PlanID
	}
	if in.TodoID != nil {
		entry.TodoID = *in.TodoID
	}
	if in.Title != nil {
		entry.Title = strings.TrimSpace(*in.Title)
	}
	if in.Body != nil {
		entry.Body = *in.Body
	}
	if in.Branch != nil {
		entry.Branch = strings.TrimSpace(*in.Branch)
	}
	if in.PR != nil {
		entry.PR = strings.TrimSpace(*in.PR)
	}
	if in.ExternalRef != nil {
		entry.ExternalRef = strings.TrimSpace(*in.ExternalRef)
	}
	if in.Tags != nil {
		entry.Tags = *in.Tags
	}
	if in.Meta != nil {
		entry.Meta = *in.Meta
	}
	return s.save(ctx, entry)
}

// AppendToJournalEntry adds a section to an entry's body. An agent recording progress
// on work it already wrote up should not have to read, splice and resend the
// whole body just to add a paragraph.
func (s *JournalService) AppendToJournalEntry(ctx context.Context, actor ports.Actor, id domain.JournalID, section string) (domain.JournalEntry, error) {
	text := strings.TrimSpace(section)
	if text == "" {
		return domain.JournalEntry{}, domain.Invalid("section", "is required")
	}
	entry, err := s.writable(ctx, actor, id)
	if err != nil {
		return domain.JournalEntry{}, err
	}

	if existing := strings.TrimRight(entry.Body, "\n"); existing == "" {
		entry.Body = text
	} else {
		// A blank line between sections keeps the body valid markdown.
		entry.Body = existing + "\n\n" + text
	}
	return s.save(ctx, entry)
}

func (s *JournalService) DeleteJournalEntry(ctx context.Context, actor ports.Actor, id domain.JournalID) error {
	if _, err := s.writable(ctx, actor, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

// writable loads an entry and checks the actor may change it.
func (s *JournalService) writable(ctx context.Context, actor ports.Actor, id domain.JournalID) (domain.JournalEntry, error) {
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.JournalEntry{}, err
	}
	if _, err := s.guard.EnsureWrite(ctx, actor, entry.ProjectID); err != nil {
		return domain.JournalEntry{}, err
	}
	return entry, nil
}

// save validates and persists an edit. CreatedAt is left untouched: an edit
// records when the entry changed, never when the work happened.
func (s *JournalService) save(ctx context.Context, entry domain.JournalEntry) (domain.JournalEntry, error) {
	if err := rules.ValidateJournalEntry(entry); err != nil {
		return domain.JournalEntry{}, err
	}
	entry.UpdatedAt = s.clock.Now()
	return s.repo.Update(ctx, entry)
}
