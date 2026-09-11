package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"

	"folio/cli/internal/client"
	"folio/cli/internal/config"
)

func todoCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "todo",
		Short: "Create, read, update and delete todos",
	}

	cmd.PersistentFlags().StringVarP(&flagProject, "project", "p", "", "project id or slug")

	cmd.AddCommand(todoListCommand(), todoGetCommand(), todoCreateCommand(), todoUpdateCommand(), todoDeleteCommand())

	return cmd
}

var errProjectRequired = errors.New(
	`no project: pass --project, or select one with: eval "$(folio use <project>)"`,
)

func resolveProject() (string, error) {
	if project := config.Project(flagProject); project != "" {
		return project, nil
	}
	return "", errProjectRequired
}

func todoListCommand() *cobra.Command {
	var filter client.TodoFilter
	var status, tags string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List a project's todos",
		RunE: func(_ *cobra.Command, _ []string) error {
			project, err := resolveProject()
			if err != nil {
				return err
			}
			if status != "" {
				filter.Status = strings.Split(status, ",")
			}
			if tags != "" {
				filter.Tags = strings.Split(tags, ",")
			}

			folio, err := api()
			if err != nil {
				return err
			}

			todos, err := folio.ListTodos(project, filter)
			if err != nil {
				return err
			}
			return renderTodos(todos)
		},
	}

	cmd.Flags().StringVar(&status, "status", "", "comma separated: pending,in_progress,done,blocked,cancelled")
	cmd.Flags().StringVar(&filter.Priority, "priority", "", "low, medium or high")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")
	registerTagCompletion(cmd)
	cmd.Flags().StringVarP(&filter.Search, "query", "q", "", "match the title")
	cmd.Flags().StringVar(&filter.PlanID, "plan", "", "only todos under this plan")
	cmd.Flags().StringVar(&filter.TicketID, "ticket", "", "only todos under this ticket")
	cmd.Flags().IntVar(&filter.Limit, "limit", 0, "maximum rows")
	cmd.Flags().IntVar(&filter.Offset, "offset", 0, "rows to skip")

	return cmd
}

func todoGetCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "get <id>",
		Short: "Show one todo",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			folio, err := api()
			if err != nil {
				return err
			}

			todo, err := folio.GetTodo(args[0])
			if err != nil {
				return err
			}
			return renderTodo(todo)
		},
	}
}

func todoCreateCommand() *cobra.Command {
	var details, status, priority, plan, ticket, due, tags string

	cmd := &cobra.Command{
		Use:   "create <title>",
		Short: "Create a todo",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			project, err := resolveProject()
			if err != nil {
				return err
			}

			in := client.TodoInput{Title: &args[0]}
			setIf(&in.Details, details)
			setIf(&in.Status, status)
			setIf(&in.Priority, priority)
			setIf(&in.PlanID, plan)
			setIf(&in.TicketID, ticket)
			setIf(&in.DueDate, due)
			if err := setTags(&in.Tags, tags); err != nil {
				return err
			}

			// An untagged todo is findable only by its title, so it drops out
			// of every `--tags` query the moment the project has more than a
			// screenful. Warning rather than failing: a quick capture is a
			// legitimate use, and stderr keeps piped output clean.
			if tags == "" {
				fmt.Fprintln(os.Stderr, "folio: no --tags, so this todo will not surface in a tag query")
				fmt.Fprintln(os.Stderr, "  context: "+strings.Join(contextTags, ", "))
				fmt.Fprintln(os.Stderr, "  kind:    "+strings.Join(kindTags, ", "))
			}

			folio, err := api()
			if err != nil {
				return err
			}

			todo, err := folio.CreateTodo(project, in)
			if err != nil {
				return err
			}
			return renderTodo(todo)
		},
	}

	cmd.Flags().StringVar(&details, "details", "", "longer description")
	cmd.Flags().StringVar(&status, "status", "", "defaults to pending")
	cmd.Flags().StringVar(&priority, "priority", "", "defaults to medium")
	cmd.Flags().StringVar(&plan, "plan", "", "plan id to file it under")
	cmd.Flags().StringVar(&ticket, "ticket", "", "ticket id to file it under")
	cmd.Flags().StringVar(&due, "due", "", "due date, RFC 3339")
	cmd.Flags().StringVar(&tags, "tags", "", tagHelp())
	registerTagCompletion(cmd)

	return cmd
}

func todoUpdateCommand() *cobra.Command {
	var title, details, status, priority, plan, ticket, due, tags string

	cmd := &cobra.Command{
		Use:   "update <id>",
		Short: "Update a todo, leaving unset fields alone",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			in := client.TodoInput{}
			setIf(&in.Title, title)
			setIf(&in.Details, details)
			setIf(&in.Status, status)
			setIf(&in.Priority, priority)
			setIf(&in.PlanID, plan)
			setIf(&in.TicketID, ticket)
			setIf(&in.DueDate, due)
			if err := setTags(&in.Tags, tags); err != nil {
				return err
			}

			if in == (client.TodoInput{}) {
				return errors.New("nothing to update: pass at least one field")
			}

			folio, err := api()
			if err != nil {
				return err
			}

			todo, err := folio.UpdateTodo(args[0], in)
			if err != nil {
				return err
			}
			return renderTodo(todo)
		},
	}

	cmd.Flags().StringVar(&title, "title", "", "new title")
	cmd.Flags().StringVar(&details, "details", "", "new description")
	cmd.Flags().StringVar(&status, "status", "", "pending, in_progress, done, blocked or cancelled")
	cmd.Flags().StringVar(&priority, "priority", "", "low, medium or high")
	cmd.Flags().StringVar(&plan, "plan", "", "move under this plan")
	cmd.Flags().StringVar(&ticket, "ticket", "", "move under this ticket")
	cmd.Flags().StringVar(&due, "due", "", "due date, RFC 3339")
	cmd.Flags().StringVar(&tags, "tags", "", "replace the tags; "+tagHelp())
	registerTagCompletion(cmd)

	return cmd
}

func todoDeleteCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a todo",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			folio, err := api()
			if err != nil {
				return err
			}

			if err := folio.DeleteTodo(args[0]); err != nil {
				return err
			}
			if !flagJSON {
				fmt.Println("deleted " + args[0])
			}
			return nil
		},
	}
}

func setIf(target **string, value string) {
	if value != "" {
		v := value
		*target = &v
	}
}

func setTags(target **[]string, value string) error {
	if value == "" {
		return nil
	}
	tags, err := parseTags(value)
	if err != nil {
		return err
	}
	*target = &tags
	return nil
}

func renderTodo(todo client.Todo) error {
	if flagJSON {
		return encode(todo)
	}
	return renderTodos([]client.Todo{todo})
}

func renderTodos(todos []client.Todo) error {
	if flagJSON {
		return encode(todos)
	}

	if len(todos) == 0 {
		fmt.Println("no todos")
		return nil
	}

	out := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	fmt.Fprintln(out, "ID\tSTATUS\tPRIORITY\tTITLE\tTAGS")
	for _, todo := range todos {
		status := todo.Status
		if todo.Blocked {
			status += " (blocked)"
		}
		fmt.Fprintf(out, "%s\t%s\t%s\t%s\t%s\n", todo.ID, status, todo.Priority, todo.Title, strings.Join(todo.Tags, ","))
	}
	return out.Flush()
}

func encode(value any) error {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(value)
}
