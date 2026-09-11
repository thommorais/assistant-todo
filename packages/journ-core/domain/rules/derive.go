package rules

import (
	"strings"

	"journ/journ-core/domain"
)

// ApplyBlocked recomputes Blocked for every todo against the full set, so
// dependency resolution is accurate. Blocked is transient: it is derived on
// read and never written back. A dependency that is absent from the set
// (deleted, or in another project) does not block.
func ApplyBlocked(todos []domain.Todo) {
	byID := make(map[domain.TodoID]domain.Todo, len(todos))
	for _, t := range todos {
		byID[t.ID] = t
	}
	for i, t := range todos {
		blocked := false
		for _, depID := range t.DependsOn {
			dep, ok := byID[depID]
			if ok && !dep.Status.IsTerminal() {
				blocked = true
				break
			}
		}
		todos[i].Blocked = blocked
	}
}

// ProgressOf counts a plan's completion. Cancelled todos leave the
// denominator: work that was called off should not hold a plan below 100%.
func ProgressOf(todos []domain.Todo) domain.Progress {
	var p domain.Progress
	for _, t := range todos {
		if t.Status == domain.TodoCancelled {
			continue
		}
		p.Total++
		if t.Status == domain.TodoDone {
			p.Done++
		}
	}
	return p
}

// CanTransitionTodo reports whether a status change is legal. The only
// forbidden move is reviving a cancelled todo: cancellation is a deliberate
// end state, and reopening one hides history that a new todo would keep.
func CanTransitionTodo(from, to domain.TodoStatus) error {
	if !todoStatuses[to] {
		return domain.Invalid("status", "must be one of pending, in_progress, done, blocked, cancelled")
	}
	if from == to {
		return nil
	}
	if from == domain.TodoCancelled {
		return domain.Invalid("status", "a cancelled todo cannot be reopened; create a new one instead")
	}
	return nil
}

// CanTransitionTicket reports whether a status change is legal. As with a
// todo, cancellation is the one end state that cannot be undone; closing is
// reversible because work reopens.
func CanTransitionTicket(from, to domain.TicketStatus) error {
	if !ticketStatuses[to] {
		return domain.Invalid("status", "must be one of open, in_progress, blocked, closed, cancelled")
	}
	if from == to {
		return nil
	}
	if from == domain.TicketCancelled {
		return domain.Invalid("status", "a cancelled ticket cannot be reopened; create a new one instead")
	}
	return nil
}

// NextPosition returns the position for a todo appended to the given set.
func NextPosition(todos []domain.Todo) int {
	max := 0
	for _, t := range todos {
		if t.Position > max {
			max = t.Position
		}
	}
	return max + 1
}

// Snippet trims text to max runes for a search result, cutting on a word
// boundary where one is close enough to the limit to be worth keeping.
func Snippet(text string, max int) string {
	clean := strings.Join(strings.Fields(text), " ")
	runes := []rune(clean)
	if len(runes) <= max {
		return clean
	}
	cut := string(runes[:max])
	if idx := strings.LastIndex(cut, " "); idx > max/2 {
		cut = cut[:idx]
	}
	return strings.TrimRight(cut, " ,.;:") + "…"
}
