package services

import (
	"context"
	"strings"

	"journ/journ-core/domain"
	"journ/journ-core/domain/rules"
	"journ/journ-core/ports"
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

// LogService manages the work log: titled, searchable entries describing what
// was built, how, and where it stands.
type LogService struct {
	repo  ports.LogRepository
	guard ports.Guard
	clock ports.Clock
	ids   ports.IDGenerator
	log   ports.Logger
}

func NewLogService(repo ports.LogRepository, guard ports.Guard, clock ports.Clock, ids ports.IDGenerator, log ports.Logger) *LogService {
	return &LogService{repo: repo, guard: guard, clock: clock, ids: ids, log: log}
}

var _ ports.LogUseCase = (*LogService)(nil)

func (s *LogService) ListLogs(ctx context.Context, actor ports.Actor, project domain.ProjectID, f domain.LogFilter) ([]domain.LogEntry, error) {
	if _, err := s.guard.EnsureRead(ctx, actor, project); err != nil {
		return nil, err
	}
	f.Limit = clampLimit(f.Limit)
	entries, err := s.repo.List(ctx, project, f)
	if err != nil {
		return nil, err
	}
	if entries == nil {
		entries = []domain.LogEntry{}
	}
	return entries, nil
}

func (s *LogService) GetLog(ctx context.Context, actor ports.Actor, id domain.LogID) (domain.LogEntry, error) {
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.LogEntry{}, err
	}
	if _, err := s.guard.EnsureRead(ctx, actor, entry.ProjectID); err != nil {
		return domain.LogEntry{}, err
	}
	return entry, nil
}

func (s *LogService) WriteLog(ctx context.Context, actor ports.Actor, in ports.WriteLogInput) (domain.LogEntry, error) {
	if _, err := s.guard.EnsureWrite(ctx, actor, in.ProjectID); err != nil {
		return domain.LogEntry{}, err
	}

	now := s.clock.Now()
	entry := domain.LogEntry{
		ID:        domain.LogID(s.ids.NewID()),
		ProjectID: in.ProjectID,
		PlanID:    in.PlanID,
		TodoID:    in.TodoID,
		Title:     strings.TrimSpace(in.Title),
		Body:      in.Body,
		Branch:    strings.TrimSpace(in.Branch),
		PR:        strings.TrimSpace(in.PR),
		Ticket:    strings.TrimSpace(in.Ticket),
		Tags:      in.Tags,
		Meta:      in.Meta,
		CreatedBy: actor.UserID,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := rules.ValidateLogEntry(entry); err != nil {
		return domain.LogEntry{}, err
	}
	return s.repo.Create(ctx, entry)
}

func (s *LogService) UpdateLog(ctx context.Context, actor ports.Actor, id domain.LogID, in ports.UpdateLogInput) (domain.LogEntry, error) {
	entry, err := s.writable(ctx, actor, id)
	if err != nil {
		return domain.LogEntry{}, err
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
	if in.Ticket != nil {
		entry.Ticket = strings.TrimSpace(*in.Ticket)
	}
	if in.Tags != nil {
		entry.Tags = *in.Tags
	}
	if in.Meta != nil {
		entry.Meta = *in.Meta
	}
	return s.save(ctx, entry)
}

// AppendToLog adds a section to an entry's body. An agent recording progress
// on work it already wrote up should not have to read, splice and resend the
// whole body just to add a paragraph.
func (s *LogService) AppendToLog(ctx context.Context, actor ports.Actor, id domain.LogID, section string) (domain.LogEntry, error) {
	text := strings.TrimSpace(section)
	if text == "" {
		return domain.LogEntry{}, domain.Invalid("section", "is required")
	}
	entry, err := s.writable(ctx, actor, id)
	if err != nil {
		return domain.LogEntry{}, err
	}

	if existing := strings.TrimRight(entry.Body, "\n"); existing == "" {
		entry.Body = text
	} else {
		// A blank line between sections keeps the body valid markdown.
		entry.Body = existing + "\n\n" + text
	}
	return s.save(ctx, entry)
}

func (s *LogService) DeleteLog(ctx context.Context, actor ports.Actor, id domain.LogID) error {
	if _, err := s.writable(ctx, actor, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

// writable loads an entry and checks the actor may change it.
func (s *LogService) writable(ctx context.Context, actor ports.Actor, id domain.LogID) (domain.LogEntry, error) {
	entry, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.LogEntry{}, err
	}
	if _, err := s.guard.EnsureWrite(ctx, actor, entry.ProjectID); err != nil {
		return domain.LogEntry{}, err
	}
	return entry, nil
}

// save validates and persists an edit. CreatedAt is left untouched: an edit
// records when the entry changed, never when the work happened.
func (s *LogService) save(ctx context.Context, entry domain.LogEntry) (domain.LogEntry, error) {
	if err := rules.ValidateLogEntry(entry); err != nil {
		return domain.LogEntry{}, err
	}
	entry.UpdatedAt = s.clock.Now()
	return s.repo.Update(ctx, entry)
}
