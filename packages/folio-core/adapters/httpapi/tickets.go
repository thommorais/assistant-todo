package httpapi

import (
	"net/http"

	"github.com/pocketbase/pocketbase/core"

	"folio/folio-core/domain"
	"folio/folio-core/ports"
)

func (h *Handler) listTickets(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	filter := domain.TicketFilter{
		Priority: domain.Priority(e.Request.URL.Query().Get("priority")),
		Assignee: domain.UserID(e.Request.URL.Query().Get("assignee")),
		Tags:     csv(e, "tags"),
		Search:   e.Request.URL.Query().Get("q"),
		Limit:    queryInt(e, "limit"),
		Offset:   queryInt(e, "offset"),
	}
	for _, s := range csv(e, "status") {
		filter.Status = append(filter.Status, domain.TicketStatus(s))
	}

	tickets, err := h.tickets.ListTickets(e.Request.Context(), actorOf(e), project, filter)
	if err != nil {
		return fail(e, err)
	}
	out := make([]ticketView, 0, len(tickets))
	for _, t := range tickets {
		out = append(out, toTicketView(t))
	}
	return e.JSON(http.StatusOK, map[string]any{"tickets": out})
}

func (h *Handler) getTicket(e *core.RequestEvent) error {
	ticket, err := h.tickets.GetTicket(e.Request.Context(), actorOf(e), domain.TicketID(e.Request.PathValue("ticket")))
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toTicketView(ticket))
}

func (h *Handler) getTicketBySlug(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	ticket, err := h.tickets.GetTicketBySlug(e.Request.Context(), actorOf(e), project, e.Request.PathValue("slug"))
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toTicketView(ticket))
}

func (h *Handler) getTicketBrief(e *core.RequestEvent) error {
	in := ports.BriefOptions{RecentLogs: queryInt(e, "recent_logs")}
	brief, err := h.tickets.GetTicketBrief(e.Request.Context(), actorOf(e), domain.TicketID(e.Request.PathValue("ticket")), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toTicketBriefView(brief))
}

func (h *Handler) getTicketBriefBySlug(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	in := ports.BriefOptions{RecentLogs: queryInt(e, "recent_logs")}
	brief, err := h.tickets.GetTicketBriefBySlug(e.Request.Context(), actorOf(e), project, e.Request.PathValue("slug"), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toTicketBriefView(brief))
}

type ticketBody struct {
	Slug        *string   `json:"slug"`
	Title       *string   `json:"title"`
	Body        *string   `json:"body"`
	Status      *string   `json:"status"`
	Priority    *string   `json:"priority"`
	Assignee    *string   `json:"assignee"`
	Tags        *[]string `json:"tags"`
	ExternalRef *string   `json:"external_ref"`
}

func (h *Handler) createTicket(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	var body ticketBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}

	in := ports.CreateTicketInput{ProjectID: project}
	if body.Slug != nil {
		in.Slug = *body.Slug
	}
	if body.Title != nil {
		in.Title = *body.Title
	}
	if body.Body != nil {
		in.Body = *body.Body
	}
	if body.Status != nil {
		in.Status = domain.TicketStatus(*body.Status)
	}
	if body.Priority != nil {
		in.Priority = domain.Priority(*body.Priority)
	}
	if body.Assignee != nil {
		in.Assignee = domain.UserID(*body.Assignee)
	}
	if body.Tags != nil {
		in.Tags = *body.Tags
	}
	if body.ExternalRef != nil {
		in.ExternalRef = *body.ExternalRef
	}

	ticket, err := h.tickets.CreateTicket(e.Request.Context(), actorOf(e), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusCreated, toTicketView(ticket))
}

func (h *Handler) updateTicket(e *core.RequestEvent) error {
	var body ticketBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}
	in := ports.UpdateTicketInput{
		Slug: body.Slug, Title: body.Title, Body: body.Body,
		Tags: body.Tags, ExternalRef: body.ExternalRef,
	}
	if body.Status != nil {
		s := domain.TicketStatus(*body.Status)
		in.Status = &s
	}
	if body.Priority != nil {
		p := domain.Priority(*body.Priority)
		in.Priority = &p
	}
	if body.Assignee != nil {
		a := domain.UserID(*body.Assignee)
		in.Assignee = &a
	}

	ticket, err := h.tickets.UpdateTicket(e.Request.Context(), actorOf(e), domain.TicketID(e.Request.PathValue("ticket")), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toTicketView(ticket))
}

func (h *Handler) deleteTicket(e *core.RequestEvent) error {
	if err := h.tickets.DeleteTicket(e.Request.Context(), actorOf(e), domain.TicketID(e.Request.PathValue("ticket"))); err != nil {
		return fail(e, err)
	}
	return e.NoContent(http.StatusNoContent)
}
