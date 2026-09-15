package domain

import "time"

type TicketStatus string

const (
	TicketOpen       TicketStatus = "open"
	TicketInProgress TicketStatus = "in_progress"
	TicketBlocked    TicketStatus = "blocked"
	TicketClosed     TicketStatus = "closed"
	TicketCancelled  TicketStatus = "cancelled"
)

func (s TicketStatus) IsTerminal() bool {
	return s == TicketClosed || s == TicketCancelled
}

type Ticket struct {
	ID          TicketID
	ProjectID   ProjectID
	Slug        string
	Title       string
	Body        string
	Status      TicketStatus
	Priority    Priority
	Assignee    UserID
	Tags        []string
	ExternalRef string
	CreatedBy   UserID
	CreatedAt   time.Time
	UpdatedAt   time.Time

	Progress Progress
}

type TicketFilter struct {
	Status   []TicketStatus
	Priority Priority
	Assignee UserID
	Tags     []string
	Search   string
	Limit    int
	Offset   int
}

type TicketBrief struct {
	Ticket  Ticket
	Plans   []Plan
	Todos   []Todo
	Journal []JournalEntry
	Docs    []Doc
}
