// Package httpapi is the driving adapter that exposes the journ use cases as
// a REST API mounted on PocketBase's router. It maps domain models to wire
// DTOs and domain errors to status codes; it holds no business logic.
package httpapi

import (
	"time"

	"journ/journ-core/domain"
)

// The view types are the API contract. They are deliberately separate from
// the domain models so a field rename inside the hexagon does not silently
// break every client.

type memberView struct {
	UserID string `json:"user_id"`
	Email  string `json:"email,omitempty"`
	Name   string `json:"name,omitempty"`
	Role   string `json:"role"`
}

type projectView struct {
	ID        string       `json:"id"`
	Slug      string       `json:"slug"`
	Name      string       `json:"name"`
	Descr     string       `json:"descr,omitempty"`
	Archived  bool         `json:"archived"`
	Members   []memberView `json:"members"`
	CreatedAt string       `json:"created_at"`
	UpdatedAt string       `json:"updated_at"`
}

func toProjectView(p domain.Project) projectView {
	members := make([]memberView, 0, len(p.Members))
	for _, m := range p.Members {
		members = append(members, memberView{
			UserID: string(m.UserID), Email: m.Email, Name: m.Name, Role: string(m.Role),
		})
	}
	return projectView{
		ID: string(p.ID), Slug: p.Slug, Name: p.Name, Descr: p.Descr,
		Archived: p.Archived, Members: members,
		CreatedAt: rfc3339(p.CreatedAt), UpdatedAt: rfc3339(p.UpdatedAt),
	}
}

type progressView struct {
	Total   int `json:"total"`
	Done    int `json:"done"`
	Percent int `json:"percent"`
}

type planView struct {
	ID        string       `json:"id"`
	ProjectID string       `json:"project_id"`
	TicketID  string       `json:"ticket_id,omitempty"`
	Title     string       `json:"title"`
	Goal      string       `json:"goal,omitempty"`
	Status    string       `json:"status"`
	Tags      []string     `json:"tags"`
	Progress  progressView `json:"progress"`
	CreatedBy string       `json:"created_by,omitempty"`
	CreatedAt string       `json:"created_at"`
	UpdatedAt string       `json:"updated_at"`
}

func toPlanView(p domain.Plan) planView {
	return planView{
		ID: string(p.ID), ProjectID: string(p.ProjectID), TicketID: string(p.TicketID), Title: p.Title, Goal: p.Goal,
		Status: string(p.Status), Tags: orEmpty(p.Tags),
		Progress:  progressView{Total: p.Progress.Total, Done: p.Progress.Done, Percent: p.Progress.Percent()},
		CreatedBy: string(p.CreatedBy),
		CreatedAt: rfc3339(p.CreatedAt), UpdatedAt: rfc3339(p.UpdatedAt),
	}
}

type ticketView struct {
	ID          string       `json:"id"`
	ProjectID   string       `json:"project_id"`
	Slug        string       `json:"slug"`
	Title       string       `json:"title"`
	Body        string       `json:"body"`
	Status      string       `json:"status"`
	Priority    string       `json:"priority"`
	Assignee    string       `json:"assignee,omitempty"`
	Tags        []string     `json:"tags"`
	ExternalRef string       `json:"external_ref,omitempty"`
	Progress    progressView `json:"progress"`
	CreatedBy   string       `json:"created_by,omitempty"`
	CreatedAt   string       `json:"created_at"`
	UpdatedAt   string       `json:"updated_at"`
}

func toTicketView(t domain.Ticket) ticketView {
	return ticketView{
		ID: string(t.ID), ProjectID: string(t.ProjectID), Slug: t.Slug,
		Title: t.Title, Body: t.Body, Status: string(t.Status),
		Priority: string(t.Priority), Assignee: string(t.Assignee),
		Tags: orEmpty(t.Tags), ExternalRef: t.ExternalRef,
		Progress:  progressView{Total: t.Progress.Total, Done: t.Progress.Done, Percent: t.Progress.Percent()},
		CreatedBy: string(t.CreatedBy),
		CreatedAt: rfc3339(t.CreatedAt), UpdatedAt: rfc3339(t.UpdatedAt),
	}
}

type todoView struct {
	ID        string   `json:"id"`
	ProjectID string   `json:"project_id"`
	TicketID  string   `json:"ticket_id,omitempty"`
	PlanID    string   `json:"plan_id,omitempty"`
	Title     string   `json:"title"`
	Details   string   `json:"details,omitempty"`
	Status    string   `json:"status"`
	Priority  string   `json:"priority"`
	Tags      []string `json:"tags"`
	Position  int      `json:"position"`
	DependsOn []string `json:"depends_on"`
	DueDate   string   `json:"due_date,omitempty"`
	// Blocked is derived from the dependencies' statuses, not stored.
	Blocked   bool   `json:"blocked"`
	CreatedBy string `json:"created_by,omitempty"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func toTodoView(t domain.Todo) todoView {
	deps := make([]string, 0, len(t.DependsOn))
	for _, d := range t.DependsOn {
		deps = append(deps, string(d))
	}
	v := todoView{
		ID: string(t.ID), ProjectID: string(t.ProjectID), TicketID: string(t.TicketID), PlanID: string(t.PlanID),
		Title: t.Title, Details: t.Details, Status: string(t.Status), Priority: string(t.Priority),
		Tags: orEmpty(t.Tags), Position: t.Position, DependsOn: deps, Blocked: t.Blocked,
		CreatedBy: string(t.CreatedBy),
		CreatedAt: rfc3339(t.CreatedAt), UpdatedAt: rfc3339(t.UpdatedAt),
	}
	if t.DueDate != nil {
		v.DueDate = rfc3339(*t.DueDate)
	}
	return v
}

type logView struct {
	ID          string         `json:"id"`
	ProjectID   string         `json:"project_id"`
	TicketID    string         `json:"ticket_id,omitempty"`
	PlanID      string         `json:"plan_id,omitempty"`
	TodoID      string         `json:"todo_id,omitempty"`
	Title       string         `json:"title"`
	Body        string         `json:"body"`
	Branch      string         `json:"branch,omitempty"`
	PR          string         `json:"pr,omitempty"`
	ExternalRef string         `json:"external_ref,omitempty"`
	Meta        map[string]any `json:"meta,omitempty"`
	Tags        []string       `json:"tags"`
	CreatedBy   string         `json:"created_by,omitempty"`
	CreatedAt   string         `json:"created_at"`
	UpdatedAt   string         `json:"updated_at"`
}

func toLogView(e domain.LogEntry) logView {
	return logView{
		ID: string(e.ID), ProjectID: string(e.ProjectID), TicketID: string(e.TicketID),
		PlanID: string(e.PlanID), TodoID: string(e.TodoID), Title: e.Title, Body: e.Body,
		Branch: e.Branch, PR: e.PR, ExternalRef: e.ExternalRef,
		Meta: e.Meta, Tags: orEmpty(e.Tags), CreatedBy: string(e.CreatedBy),
		CreatedAt: rfc3339(e.CreatedAt), UpdatedAt: rfc3339(e.UpdatedAt),
	}
}

type docView struct {
	ID        string   `json:"id"`
	ProjectID string   `json:"project_id"`
	TicketID  string   `json:"ticket_id,omitempty"`
	Slug      string   `json:"slug"`
	Title     string   `json:"title"`
	Body      string   `json:"body"`
	Tags      []string `json:"tags"`
	CreatedBy string   `json:"created_by,omitempty"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

func toDocView(d domain.Doc) docView {
	return docView{
		ID: string(d.ID), ProjectID: string(d.ProjectID), TicketID: string(d.TicketID), Slug: d.Slug, Title: d.Title,
		Body: d.Body, Tags: orEmpty(d.Tags), CreatedBy: string(d.CreatedBy),
		CreatedAt: rfc3339(d.CreatedAt), UpdatedAt: rfc3339(d.UpdatedAt),
	}
}

type searchHitView struct {
	Kind      string   `json:"kind"`
	ID        string   `json:"id"`
	ProjectID string   `json:"project_id"`
	Title     string   `json:"title"`
	Snippet   string   `json:"snippet,omitempty"`
	Tags      []string `json:"tags"`
	CreatedAt string   `json:"created_at"`
}

func toSearchHitView(h domain.SearchHit) searchHitView {
	return searchHitView{
		Kind: string(h.Kind), ID: h.ID, ProjectID: string(h.ProjectID),
		Title: h.Title, Snippet: h.Snippet, Tags: orEmpty(h.Tags),
		CreatedAt: rfc3339(h.CreatedAt),
	}
}

// batchErrorView reports one rejected item of a batch write.
type batchErrorView struct {
	Index  int    `json:"index"`
	Title  string `json:"title,omitempty"`
	Reason string `json:"reason"`
}

func rfc3339(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.UTC().Format(time.RFC3339)
}

// orEmpty keeps JSON arrays as [] rather than null, so clients can iterate
// without a nil check.
func orEmpty(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}
