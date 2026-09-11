package services

import (
	"context"
	"sort"

	"folio/folio-core/domain"
	"folio/folio-core/ports"
)

const DefaultRecentLogs = 10

func (s *TicketService) GetTicketBrief(ctx context.Context, actor ports.Actor, id domain.TicketID, in ports.BriefOptions) (domain.TicketBrief, error) {
	ticket, err := s.GetTicket(ctx, actor, id)
	if err != nil {
		return domain.TicketBrief{}, err
	}
	return s.brief(ctx, ticket, in)
}

func (s *TicketService) GetTicketBriefBySlug(ctx context.Context, actor ports.Actor, project domain.ProjectID, slug string, in ports.BriefOptions) (domain.TicketBrief, error) {
	ticket, err := s.GetTicketBySlug(ctx, actor, project, slug)
	if err != nil {
		return domain.TicketBrief{}, err
	}
	return s.brief(ctx, ticket, in)
}

func (s *TicketService) brief(ctx context.Context, ticket domain.Ticket, in ports.BriefOptions) (domain.TicketBrief, error) {
	recent := in.RecentLogs
	if recent <= 0 {
		recent = DefaultRecentLogs
	}

	plans, err := s.plans.ListByTicket(ctx, ticket.ID)
	if err != nil {
		return domain.TicketBrief{}, err
	}

	todos, err := s.todos.ListByTicket(ctx, ticket.ID)
	if err != nil {
		return domain.TicketBrief{}, err
	}
	sortOpenFirst(todos)

	logs, err := s.logs.List(ctx, ticket.ProjectID, domain.LogFilter{TicketID: ticket.ID, Limit: recent})
	if err != nil {
		return domain.TicketBrief{}, err
	}

	docs, err := s.docs.List(ctx, ticket.ProjectID, domain.DocFilter{TicketID: ticket.ID, Limit: MaxPageSize})
	if err != nil {
		return domain.TicketBrief{}, err
	}

	return domain.TicketBrief{
		Ticket: ticket,
		Plans:  plans,
		Todos:  todos,
		Logs:   logs,
		Docs:   docs,
	}, nil
}

func sortOpenFirst(todos []domain.Todo) {
	sort.SliceStable(todos, func(i, j int) bool {
		return !todos[i].Status.IsTerminal() && todos[j].Status.IsTerminal()
	})
}
