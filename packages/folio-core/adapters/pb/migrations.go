package pb

import (
	"fmt"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

// Register installs the folio schema. It is idempotent: an existing
// collection is left alone, so the app can call it on every boot.
//
// Access rules are expressed in PocketBase rule syntax and enforced by
// PocketBase itself for any direct REST access to these collections. The
// folio API additionally checks permissions in the service layer, so the
// rules here are the second line of defence rather than the only one.
// The rules reference journ_members, which cannot be resolved while that
// collection does not yet exist, so structure is created first and the access
// rules are applied in a second pass once every collection is present.
func Register(app core.App) error {
	if err := renameLogsToJournal(app); err != nil {
		return fmt.Errorf("rename journal: %w", err)
	}
	if err := ensureProjects(app); err != nil {
		return fmt.Errorf("projects: %w", err)
	}
	if err := ensureMembers(app); err != nil {
		return fmt.Errorf("members: %w", err)
	}
	// Tickets come before plans, todos, logs and docs: each of those carries
	// a relation to this collection, so it has to exist first.
	if err := ensureTickets(app); err != nil {
		return fmt.Errorf("tickets: %w", err)
	}
	if err := ensurePlans(app); err != nil {
		return fmt.Errorf("plans: %w", err)
	}
	if err := ensureTodos(app); err != nil {
		return fmt.Errorf("todos: %w", err)
	}
	if err := ensureJournal(app); err != nil {
		return fmt.Errorf("journal: %w", err)
	}
	if err := ensureDocs(app); err != nil {
		return fmt.Errorf("docs: %w", err)
	}
	// Existing databases predate tickets: their collections were created by
	// an earlier Register and ensureX leaves them alone, so the new fields
	// are added in a separate pass.
	if err := alterForTickets(app); err != nil {
		return fmt.Errorf("alter: %w", err)
	}
	if err := applyRules(app); err != nil {
		return fmt.Errorf("rules: %w", err)
	}
	return nil
}

func renameLogsToJournal(app core.App) error {
	c, ok := find(app, "journ_logs")
	if !ok {
		return nil
	}
	if _, taken := find(app, ColJournal); taken {
		return nil
	}

	c.Name = ColJournal
	renamed := make([]string, 0, len(c.Indexes))
	for _, idx := range c.Indexes {
		renamed = append(renamed, strings.ReplaceAll(idx, "idx_journ_logs", "idx_journ_journal"))
	}
	c.Indexes = renamed

	return app.Save(c)
}

// alterForTickets brings a pre-ticket database up to date: it adds the ticket
// relation to every child collection and renames the log's free-text ticket
// key to external_ref. Both steps are no-ops once applied, so Register stays
// safe to call on every boot.
func alterForTickets(app core.App) error {
	tickets, err := app.FindCollectionByNameOrId(ColTickets)
	if err != nil {
		return err
	}

	for _, name := range []string{ColPlans, ColTodos, ColJournal, ColDocs} {
		c, err := app.FindCollectionByNameOrId(name)
		if err != nil {
			return err
		}
		changed := false

		// The log's "ticket" column held a free-text tracker key before the
		// ticket entity existed. It is renamed rather than replaced: keeping
		// the field's id makes PocketBase rename the underlying column, so
		// the values survive. Dropping and re-adding would silently empty it.
		if text, isText := c.Fields.GetByName("ticket").(*core.TextField); isText {
			text.Name = "external_ref"
			changed = true
		}

		// Only once "ticket" is free can the relation take the name.
		if c.Fields.GetByName("ticket") == nil {
			c.Fields.Add(ticketField(tickets))
			changed = true
		}

		if changed {
			if err := app.Save(c); err != nil {
				return fmt.Errorf("%s: %w", name, err)
			}
		}
	}
	return nil
}

// find returns the collection if it already exists.
func find(app core.App, name string) (*core.Collection, bool) {
	c, err := app.FindCollectionByNameOrId(name)
	if err != nil || c == nil {
		return nil, false
	}
	return c, true
}
