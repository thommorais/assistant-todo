package domain

// Named types (not aliases) for every identifier: passing a ProjectID where a
// TodoID is expected is a compile error, which catches wiring mistakes that
// string-typed IDs would let through silently.
type (
	ProjectID string
	PlanID    string
	TodoID    string
	LogID     string
	DocID     string
	UserID    string
)
