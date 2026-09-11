package ports

import (
	"context"

	"journ/journ-core/domain"
)

// The use case ports are the API of the hexagon: every driving adapter (REST,
// MCP, CLI, web) calls these and nothing deeper. Each takes an Actor so the
// service can authorise the call itself rather than trusting the transport.

type ProjectUseCase interface {
	ListProjects(ctx context.Context, actor Actor, includeArchived bool) ([]domain.Project, error)
	GetProject(ctx context.Context, actor Actor, ref string) (domain.Project, error)
	CreateProject(ctx context.Context, actor Actor, in CreateProjectInput) (domain.Project, error)
	UpdateProject(ctx context.Context, actor Actor, id domain.ProjectID, in UpdateProjectInput) (domain.Project, error)
	DeleteProject(ctx context.Context, actor Actor, id domain.ProjectID) error

	AddMember(ctx context.Context, actor Actor, id domain.ProjectID, email string, role domain.Role) (domain.Project, error)
	RemoveMember(ctx context.Context, actor Actor, id domain.ProjectID, user domain.UserID) (domain.Project, error)
	SetMemberRole(ctx context.Context, actor Actor, id domain.ProjectID, user domain.UserID, role domain.Role) (domain.Project, error)
}

type CreateProjectInput struct {
	Slug  string
	Name  string
	Descr string
}

// UpdateProjectInput uses pointers so an omitted field means "leave as is",
// which a PATCH adapter can express without reading the record first.
type UpdateProjectInput struct {
	Name     *string
	Descr    *string
	Archived *bool
}

type PlanUseCase interface {
	ListPlans(ctx context.Context, actor Actor, project domain.ProjectID, statuses []domain.PlanStatus) ([]domain.Plan, error)
	GetPlan(ctx context.Context, actor Actor, id domain.PlanID) (domain.Plan, error)
	CreatePlan(ctx context.Context, actor Actor, in CreatePlanInput) (domain.Plan, error)
	UpdatePlan(ctx context.Context, actor Actor, id domain.PlanID, in UpdatePlanInput) (domain.Plan, error)
	DeletePlan(ctx context.Context, actor Actor, id domain.PlanID) error
}

// CreatePlanInput carries the plan and, optionally, its first todos: an agent
// drafting a plan knows the steps at the same moment, and one call keeps the
// plan and its steps from diverging.
type CreatePlanInput struct {
	ProjectID domain.ProjectID
	TicketID  domain.TicketID
	Title     string
	Goal      string
	Status    domain.PlanStatus
	Tags      []string
	Todos     []CreateTodoInput
}

type UpdatePlanInput struct {
	TicketID *domain.TicketID
	Title    *string
	Goal     *string
	Status   *domain.PlanStatus
	Tags     *[]string
}

type TicketUseCase interface {
	ListTickets(ctx context.Context, actor Actor, project domain.ProjectID, f domain.TicketFilter) ([]domain.Ticket, error)
	GetTicket(ctx context.Context, actor Actor, id domain.TicketID) (domain.Ticket, error)
	// GetTicketBySlug addresses a ticket the way a CLI or a URL names one.
	GetTicketBySlug(ctx context.Context, actor Actor, project domain.ProjectID, slug string) (domain.Ticket, error)
	CreateTicket(ctx context.Context, actor Actor, in CreateTicketInput) (domain.Ticket, error)
	UpdateTicket(ctx context.Context, actor Actor, id domain.TicketID, in UpdateTicketInput) (domain.Ticket, error)
	SetTicketStatus(ctx context.Context, actor Actor, id domain.TicketID, status domain.TicketStatus) (domain.Ticket, error)
	DeleteTicket(ctx context.Context, actor Actor, id domain.TicketID) error
}

type CreateTicketInput struct {
	ProjectID   domain.ProjectID
	Slug        string
	Title       string
	Body        string
	Status      domain.TicketStatus
	Priority    domain.Priority
	Assignee    domain.UserID
	Tags        []string
	ExternalRef string
}

type UpdateTicketInput struct {
	Slug        *string
	Title       *string
	Body        *string
	Status      *domain.TicketStatus
	Priority    *domain.Priority
	Assignee    *domain.UserID
	Tags        *[]string
	ExternalRef *string
}

type TodoUseCase interface {
	ListTodos(ctx context.Context, actor Actor, project domain.ProjectID, f domain.TodoFilter) ([]domain.Todo, error)
	GetTodo(ctx context.Context, actor Actor, id domain.TodoID) (domain.Todo, error)
	CreateTodo(ctx context.Context, actor Actor, in CreateTodoInput) (domain.Todo, error)
	// CreateTodos writes a batch, reporting per-item failures without
	// aborting the rest, so one bad item does not lose the good ones.
	CreateTodos(ctx context.Context, actor Actor, project domain.ProjectID, in []CreateTodoInput) (BatchResult[domain.Todo], error)
	UpdateTodo(ctx context.Context, actor Actor, id domain.TodoID, in UpdateTodoInput) (domain.Todo, error)
	SetTodoStatus(ctx context.Context, actor Actor, id domain.TodoID, status domain.TodoStatus) (domain.Todo, error)
	DeleteTodo(ctx context.Context, actor Actor, id domain.TodoID) error
}

type CreateTodoInput struct {
	ProjectID domain.ProjectID
	TicketID  domain.TicketID
	PlanID    domain.PlanID
	Title     string
	Details   string
	Status    domain.TodoStatus
	Priority  domain.Priority
	Tags      []string
	DependsOn []domain.TodoID
	DueDate   *string
}

type UpdateTodoInput struct {
	TicketID  *domain.TicketID
	PlanID    *domain.PlanID
	Title     *string
	Details   *string
	Status    *domain.TodoStatus
	Priority  *domain.Priority
	Tags      *[]string
	Position  *int
	DependsOn *[]domain.TodoID
	DueDate   *string
}

// BatchResult reports a partial success: what was written, and why the rest
// was not.
type BatchResult[T any] struct {
	Created []T
	Errors  []BatchError
}

type BatchError struct {
	Index  int
	Title  string
	Reason string
}

type LogUseCase interface {
	ListLogs(ctx context.Context, actor Actor, project domain.ProjectID, f domain.LogFilter) ([]domain.LogEntry, error)
	GetLog(ctx context.Context, actor Actor, id domain.LogID) (domain.LogEntry, error)
	WriteLog(ctx context.Context, actor Actor, in WriteLogInput) (domain.LogEntry, error)
	UpdateLog(ctx context.Context, actor Actor, id domain.LogID, in UpdateLogInput) (domain.LogEntry, error)
	// AppendToLog adds a section to an existing entry's body, which is how
	// an agent records progress on work it already wrote up without having
	// to read, edit and resend the whole body.
	AppendToLog(ctx context.Context, actor Actor, id domain.LogID, section string) (domain.LogEntry, error)
	DeleteLog(ctx context.Context, actor Actor, id domain.LogID) error
}

type WriteLogInput struct {
	ProjectID   domain.ProjectID
	TicketID    domain.TicketID
	PlanID      domain.PlanID
	TodoID      domain.TodoID
	Title       string
	Body        string
	Branch      string
	PR          string
	ExternalRef string
	Tags        []string
	Meta        map[string]any
}

type UpdateLogInput struct {
	TicketID    *domain.TicketID
	PlanID      *domain.PlanID
	TodoID      *domain.TodoID
	Title       *string
	Body        *string
	Branch      *string
	PR          *string
	ExternalRef *string
	Tags        *[]string
	Meta        *map[string]any
}

type DocUseCase interface {
	ListDocs(ctx context.Context, actor Actor, project domain.ProjectID, f domain.DocFilter) ([]domain.Doc, error)
	GetDoc(ctx context.Context, actor Actor, id domain.DocID) (domain.Doc, error)
	GetDocBySlug(ctx context.Context, actor Actor, project domain.ProjectID, slug string) (domain.Doc, error)
	CreateDoc(ctx context.Context, actor Actor, in CreateDocInput) (domain.Doc, error)
	UpdateDoc(ctx context.Context, actor Actor, id domain.DocID, in UpdateDocInput) (domain.Doc, error)
	DeleteDoc(ctx context.Context, actor Actor, id domain.DocID) error
}

type CreateDocInput struct {
	ProjectID domain.ProjectID
	TicketID  domain.TicketID
	Slug      string
	Title     string
	Body      string
	Tags      []string
}

type UpdateDocInput struct {
	TicketID *domain.TicketID
	Slug     *string
	Title    *string
	Body     *string
	Tags     *[]string
}

type SearchUseCase interface {
	Search(ctx context.Context, actor Actor, project domain.ProjectID, q domain.SearchQuery) ([]domain.SearchHit, error)
}
