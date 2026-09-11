package rules_test

import (
	"errors"
	"strings"
	"testing"

	"folio/folio-core/domain"
	"folio/folio-core/domain/rules"
)

func validTicket() domain.Ticket {
	return domain.Ticket{
		ProjectID: "p1",
		Slug:      "auth-token-expiry",
		Title:     "Tokens expire an hour early",
		Status:    domain.TicketOpen,
		Priority:  domain.PriorityMedium,
	}
}

func TestValidateTicket(t *testing.T) {
	t.Run("accepts a valid ticket", func(t *testing.T) {
		if err := rules.ValidateTicket(validTicket()); err != nil {
			t.Fatalf("want nil, got %v", err)
		}
	})

	t.Run("requires a project", func(t *testing.T) {
		ticket := validTicket()
		ticket.ProjectID = ""
		if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})

	t.Run("requires a title", func(t *testing.T) {
		ticket := validTicket()
		ticket.Title = "   "
		if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})

	t.Run("rejects a slug that is not kebab-case", func(t *testing.T) {
		for _, slug := range []string{"Has Space", "UPPER", "trailing-", ""} {
			ticket := validTicket()
			ticket.Slug = slug
			if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
				t.Errorf("slug %q: want validation error, got %v", slug, err)
			}
		}
	})

	t.Run("rejects an unknown status", func(t *testing.T) {
		ticket := validTicket()
		ticket.Status = "archived"
		if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})

	t.Run("rejects an unknown priority", func(t *testing.T) {
		ticket := validTicket()
		ticket.Priority = "urgent"
		if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})

	t.Run("rejects an over-long external ref", func(t *testing.T) {
		ticket := validTicket()
		ticket.ExternalRef = strings.Repeat("x", rules.RefMaxLen+1)
		if err := rules.ValidateTicket(ticket); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})
}

func TestCanTransitionTicket(t *testing.T) {
	t.Run("allows an ordinary move", func(t *testing.T) {
		if err := rules.CanTransitionTicket(domain.TicketOpen, domain.TicketInProgress); err != nil {
			t.Fatalf("want nil, got %v", err)
		}
	})

	t.Run("allows reopening a closed ticket", func(t *testing.T) {
		if err := rules.CanTransitionTicket(domain.TicketClosed, domain.TicketOpen); err != nil {
			t.Fatalf("want nil, got %v", err)
		}
	})

	t.Run("refuses to revive a cancelled ticket", func(t *testing.T) {
		if err := rules.CanTransitionTicket(domain.TicketCancelled, domain.TicketOpen); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})

	t.Run("allows a no-op on a cancelled ticket", func(t *testing.T) {
		if err := rules.CanTransitionTicket(domain.TicketCancelled, domain.TicketCancelled); err != nil {
			t.Fatalf("want nil, got %v", err)
		}
	})

	t.Run("rejects an unknown target status", func(t *testing.T) {
		if err := rules.CanTransitionTicket(domain.TicketOpen, "archived"); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})
}

func TestSameProject(t *testing.T) {
	ticket := domain.Ticket{ID: "t1", ProjectID: "p1"}

	t.Run("accepts a child in the ticket's project", func(t *testing.T) {
		if err := rules.TicketBelongsTo(ticket, "p1"); err != nil {
			t.Fatalf("want nil, got %v", err)
		}
	})

	t.Run("rejects a child from another project", func(t *testing.T) {
		if err := rules.TicketBelongsTo(ticket, "p2"); !errors.Is(err, domain.ErrValidation) {
			t.Fatalf("want validation error, got %v", err)
		}
	})
}
