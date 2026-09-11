package pb

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
)

// Register installs the journ schema. It is idempotent: an existing
// collection is left alone, so the app can call it on every boot.
//
// Access rules are expressed in PocketBase rule syntax and enforced by
// PocketBase itself for any direct REST access to these collections. The
// journ API additionally checks permissions in the service layer, so the
// rules here are the second line of defence rather than the only one.
// The rules reference journ_members, which cannot be resolved while that
// collection does not yet exist, so structure is created first and the access
// rules are applied in a second pass once every collection is present.
func Register(app core.App) error {
	if err := ensureProjects(app); err != nil {
		return fmt.Errorf("projects: %w", err)
	}
	if err := ensureMembers(app); err != nil {
		return fmt.Errorf("members: %w", err)
	}
	if err := ensurePlans(app); err != nil {
		return fmt.Errorf("plans: %w", err)
	}
	if err := ensureTodos(app); err != nil {
		return fmt.Errorf("todos: %w", err)
	}
	if err := ensureLogs(app); err != nil {
		return fmt.Errorf("logs: %w", err)
	}
	if err := ensureDocs(app); err != nil {
		return fmt.Errorf("docs: %w", err)
	}
	if err := applyRules(app); err != nil {
		return fmt.Errorf("rules: %w", err)
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
