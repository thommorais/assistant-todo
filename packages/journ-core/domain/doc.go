package domain

import "time"

// Doc is durable project knowledge: a spec, a convention, an architecture
// note. Unlike a LogEntry it is meant to be edited and kept current.
type Doc struct {
	ID        DocID
	ProjectID ProjectID
	Slug      string
	Title     string
	Body      string
	Tags      []string
	CreatedBy UserID
	CreatedAt time.Time
	UpdatedAt time.Time
}

// DocFilter narrows a doc listing. Zero values mean "no restriction".
type DocFilter struct {
	Tags   []string
	Search string
	Limit  int
	Offset int
}

// SearchKind identifies which collection a search hit came from.
type SearchKind string

const (
	SearchKindLog  SearchKind = "log"
	SearchKindDoc  SearchKind = "doc"
	SearchKindTodo SearchKind = "todo"
	SearchKindPlan SearchKind = "plan"
)

// SearchHit is one result of a cross-collection search, flattened so a client
// can render a mixed list without knowing each source type.
type SearchHit struct {
	Kind      SearchKind
	ID        string
	ProjectID ProjectID
	Title     string
	Snippet   string
	Tags      []string
	CreatedAt time.Time
}

// SearchQuery asks for matches across the kinds listed; empty Kinds means all.
type SearchQuery struct {
	Text   string
	Kinds  []SearchKind
	Tags   []string
	Limit  int
	Offset int
}
