package services

import (
	"context"
	"strings"

	"folio/folio-core/domain"
	"folio/folio-core/domain/rules"
	"folio/folio-core/ports"
)

// TicketService manages tickets: units of work under a project that carry
// their own plans, todos, logs and docs.
type TicketService struct {
	repo  ports.TicketRepository
	todos ports.TodoRepository
	plans ports.PlanRepository
	logs  ports.LogRepository
	docs  ports.DocRepository
	guard ports.Guard
	clock ports.Clock
	ids   ports.IDGenerator
	log   ports.Logger
}

func NewTicketService(repo ports.TicketRepository, todos ports.TodoRepository, plans ports.PlanRepository, logs ports.LogRepository, docs ports.DocRepository, guard ports.Guard, clock ports.Clock, ids ports.IDGenerator, log ports.Logger) *TicketService {
	return &TicketService{repo: repo, todos: todos, plans: plans, logs: logs, docs: docs, guard: guard, clock: clock, ids: ids, log: log}
}

var _ ports.TicketUseCase = (*TicketService)(nil)

func (s *TicketService) ListTickets(ctx context.Context, actor ports.Actor, project domain.ProjectID, f domain.TicketFilter) ([]domain.Ticket, error) {
	if _, err := s.guard.EnsureRead(ctx, actor, project); err != nil {
		return nil, err
	}
	f.Limit = clampLimit(f.Limit)
	tickets, err := s.repo.List(ctx, project, f)
	if err != nil {
		return nil, err
	}
	for i := range tickets {
		if tickets[i].Progress, err = s.progress(ctx, tickets[i].ID); err != nil {
			return nil, err
		}
	}
	if tickets == nil {
		tickets = []domain.Ticket{}
	}
	return tickets, nil
}

func (s *TicketService) GetTicket(ctx context.Context, actor ports.Actor, id domain.TicketID) (domain.Ticket, error) {
	ticket, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.Ticket{}, err
	}
	if _, err := s.guard.EnsureRead(ctx, actor, ticket.ProjectID); err != nil {
		return domain.Ticket{}, err
	}
	if ticket.Progress, err = s.progress(ctx, ticket.ID); err != nil {
		return domain.Ticket{}, err
	}
	return ticket, nil
}

func (s *TicketService) GetTicketBySlug(ctx context.Context, actor ports.Actor, project domain.ProjectID, slug string) (domain.Ticket, error) {
	if _, err := s.guard.EnsureRead(ctx, actor, project); err != nil {
		return domain.Ticket{}, err
	}
	ticket, err := s.repo.GetBySlug(ctx, project, slug)
	if err != nil {
		return domain.Ticket{}, err
	}
	if ticket.Progress, err = s.progress(ctx, ticket.ID); err != nil {
		return domain.Ticket{}, err
	}
	return ticket, nil
}

// progress counts the ticket's todos, including those nested under its plans,
// because both hang off the ticket by TicketID.
func (s *TicketService) progress(ctx context.Context, id domain.TicketID) (domain.Progress, error) {
	todos, err := s.todos.ListByTicket(ctx, id)
	if err != nil {
		return domain.Progress{}, err
	}
	return rules.ProgressOf(todos), nil
}

func (s *TicketService) CreateTicket(ctx context.Context, actor ports.Actor, in ports.CreateTicketInput) (domain.Ticket, error) {
	if _, err := s.guard.EnsureWrite(ctx, actor, in.ProjectID); err != nil {
		return domain.Ticket{}, err
	}

	slug := strings.TrimSpace(in.Slug)
	if slug == "" {
		slug = rules.Slugify(in.Title)
	}
	now := s.clock.Now()
	ticket := domain.Ticket{
		ID:          domain.TicketID(s.ids.NewID()),
		ProjectID:   in.ProjectID,
		Slug:        slug,
		Title:       strings.TrimSpace(in.Title),
		Body:        in.Body,
		Status:      defaultTicketStatus(in.Status),
		Priority:    defaultPriority(in.Priority),
		Assignee:    in.Assignee,
		Tags:        in.Tags,
		ExternalRef: in.ExternalRef,
		CreatedBy:   actor.UserID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if err := rules.ValidateTicket(ticket); err != nil {
		return domain.Ticket{}, err
	}
	if err := s.slugFree(ctx, ticket.ProjectID, ticket.Slug, ""); err != nil {
		return domain.Ticket{}, err
	}
	return s.repo.Create(ctx, ticket)
}

// slugFree rejects a slug already used in the project. except is the ID of the
// ticket being updated, so keeping its own slug is not a collision with
// itself.
func (s *TicketService) slugFree(ctx context.Context, project domain.ProjectID, slug string, except domain.TicketID) error {
	existing, err := s.repo.GetBySlug(ctx, project, slug)
	if err != nil {
		if notFound(err) {
			return nil
		}
		return err
	}
	if existing.ID == except {
		return nil
	}
	return domain.ErrConflict
}

func (s *TicketService) UpdateTicket(ctx context.Context, actor ports.Actor, id domain.TicketID, in ports.UpdateTicketInput) (domain.Ticket, error) {
	ticket, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.Ticket{}, err
	}
	if _, err := s.guard.EnsureWrite(ctx, actor, ticket.ProjectID); err != nil {
		return domain.Ticket{}, err
	}

	if in.Status != nil {
		if err := rules.CanTransitionTicket(ticket.Status, *in.Status); err != nil {
			return domain.Ticket{}, err
		}
		ticket.Status = *in.Status
	}
	if in.Slug != nil {
		ticket.Slug = strings.TrimSpace(*in.Slug)
	}
	if in.Title != nil {
		ticket.Title = strings.TrimSpace(*in.Title)
	}
	if in.Body != nil {
		ticket.Body = *in.Body
	}
	if in.Priority != nil {
		ticket.Priority = *in.Priority
	}
	if in.Assignee != nil {
		ticket.Assignee = *in.Assignee
	}
	if in.Tags != nil {
		ticket.Tags = *in.Tags
	}
	if in.ExternalRef != nil {
		ticket.ExternalRef = *in.ExternalRef
	}
	if err := rules.ValidateTicket(ticket); err != nil {
		return domain.Ticket{}, err
	}
	if in.Slug != nil {
		if err := s.slugFree(ctx, ticket.ProjectID, ticket.Slug, ticket.ID); err != nil {
			return domain.Ticket{}, err
		}
	}
	ticket.UpdatedAt = s.clock.Now()
	saved, err := s.repo.Update(ctx, ticket)
	if err != nil {
		return domain.Ticket{}, err
	}
	if saved.Progress, err = s.progress(ctx, saved.ID); err != nil {
		return domain.Ticket{}, err
	}
	return saved, nil
}

func (s *TicketService) SetTicketStatus(ctx context.Context, actor ports.Actor, id domain.TicketID, status domain.TicketStatus) (domain.Ticket, error) {
	return s.UpdateTicket(ctx, actor, id, ports.UpdateTicketInput{Status: &status})
}

// DeleteTicket detaches its plans, todos, logs and docs rather than deleting
// them, for the same reason DeletePlan does: the ticket is a framing of the
// work, and dropping it should not destroy the work itself. The children fall
// back to the project they already belong to.
func (s *TicketService) DeleteTicket(ctx context.Context, actor ports.Actor, id domain.TicketID) error {
	ticket, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if _, err := s.guard.EnsureWrite(ctx, actor, ticket.ProjectID); err != nil {
		return err
	}
	if err := s.detachChildren(ctx, ticket); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

func (s *TicketService) detachChildren(ctx context.Context, ticket domain.Ticket) error {
	now := s.clock.Now()

	todos, err := s.todos.ListByTicket(ctx, ticket.ID)
	if err != nil {
		return err
	}
	for _, t := range todos {
		t.TicketID = ""
		t.UpdatedAt = now
		if _, err := s.todos.Update(ctx, t); err != nil {
			return err
		}
	}

	plans, err := s.plans.ListByTicket(ctx, ticket.ID)
	if err != nil {
		return err
	}
	for _, p := range plans {
		p.TicketID = ""
		p.UpdatedAt = now
		if _, err := s.plans.Update(ctx, p); err != nil {
			return err
		}
	}

	entries, err := s.logs.List(ctx, ticket.ProjectID, domain.LogFilter{TicketID: ticket.ID, Limit: MaxPageSize})
	if err != nil {
		return err
	}
	for _, e := range entries {
		e.TicketID = ""
		e.UpdatedAt = now
		if _, err := s.logs.Update(ctx, e); err != nil {
			return err
		}
	}

	docs, err := s.docs.List(ctx, ticket.ProjectID, domain.DocFilter{TicketID: ticket.ID, Limit: MaxPageSize})
	if err != nil {
		return err
	}
	for _, d := range docs {
		d.TicketID = ""
		d.UpdatedAt = now
		if _, err := s.docs.Update(ctx, d); err != nil {
			return err
		}
	}
	return nil
}

func defaultTicketStatus(s domain.TicketStatus) domain.TicketStatus {
	if s == "" {
		return domain.TicketOpen
	}
	return s
}
