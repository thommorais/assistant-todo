package domain

import "time"

// TicketStatus tracks a ticket through its life. A ticket is a unit of work
// large enough to carry its own plans, todos, logs and docs: a bug, a
// feature, an investigation.
type TicketStatus string

const (
	TicketOpen       TicketStatus = "open"
	TicketInProgress TicketStatus = "in_progress"
	TicketBlocked    TicketStatus = "blocked"
	TicketClosed     TicketStatus = "closed"
	TicketCancelled  TicketStatus = "cancelled"
)

// IsTerminal reports whether the ticket has reached an end state.
func (s TicketStatus) IsTerminal() bool {
	return s == TicketClosed || s == TicketCancelled
}

type Ticket struct {
	ID        TicketID
	ProjectID ProjectID
	// Slug addresses the ticket within its project, so a CLI or a URL can
	// name one without carrying an opaque ID.
	Slug     string
	Title    string
	Body     string
	Status   TicketStatus
	Priority Priority
	// Assignee is optional and unvalidated against membership: a ticket may
	// be parked on someone before they are added to the project.
	Assignee UserID
	Tags     []string
	// ExternalRef points at the same work in another tracker, e.g. a Jira
	// key or a GitHub issue URL.
	ExternalRef string
	CreatedBy   UserID
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Progress is derived from the ticket's todos on read, never persisted.
	Progress Progress
}

// TicketFilter narrows a ticket listing. Zero values mean "no restriction".
type TicketFilter struct {
	Status   []TicketStatus
	Priority Priority
	Assignee UserID
	Tags     []string
	Search   string
	Limit    int
	Offset   int
}
