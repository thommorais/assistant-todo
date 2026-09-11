package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"

	"journ/cli/internal/client"
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

func requireProject() error {
	if flagProject == "" {
		return errors.New("--project is required")
	}
	return nil
}

func todoListCommand() *cobra.Command {
	var filter client.TodoFilter
	var status, tags string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List a project's todos",
		RunE: func(_ *cobra.Command, _ []string) error {
			if err := requireProject(); err != nil {
				return err
			}
			if status != "" {
				filter.Status = strings.Split(status, ",")
			}
			if tags != "" {
				filter.Tags = strings.Split(tags, ",")
			}

			todos, err := api().ListTodos(flagProject, filter)
			if err != nil {
				return err
			}
			return renderTodos(todos)
		},
	}

	cmd.Flags().StringVar(&status, "status", "", "comma separated: pending,in_progress,done,blocked,cancelled")
	cmd.Flags().StringVar(&filter.Priority, "priority", "", "low, medium or high")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")
	cmd.Flags().StringVarP(&filter.Search, "query", "q", "", "match the title")
	cmd.Flags().StringVar(&filter.PlanID, "plan", "", "only todos under this plan")
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
			todo, err := api().GetTodo(args[0])
			if err != nil {
				return err
			}
			return renderTodo(todo)
		},
	}
}

func todoCreateCommand() *cobra.Command {
	var details, status, priority, plan, due, tags string

	cmd := &cobra.Command{
		Use:   "create <title>",
		Short: "Create a todo",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if err := requireProject(); err != nil {
				return err
			}

			in := client.TodoInput{Title: &args[0]}
			setIf(&in.Details, details)
			setIf(&in.Status, status)
			setIf(&in.Priority, priority)
			setIf(&in.PlanID, plan)
			setIf(&in.DueDate, due)
			setTags(&in.Tags, tags)

			todo, err := api().CreateTodo(flagProject, in)
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
	cmd.Flags().StringVar(&due, "due", "", "due date, RFC 3339")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")

	return cmd
}

func todoUpdateCommand() *cobra.Command {
	var title, details, status, priority, plan, due, tags string

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
			setIf(&in.DueDate, due)
			setTags(&in.Tags, tags)

			if in == (client.TodoInput{}) {
				return errors.New("nothing to update: pass at least one field")
			}

			todo, err := api().UpdateTodo(args[0], in)
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
	cmd.Flags().StringVar(&due, "due", "", "due date, RFC 3339")
	cmd.Flags().StringVar(&tags, "tags", "", "replace the tags, comma separated")

	return cmd
}

func todoDeleteCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a todo",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if err := api().DeleteTodo(args[0]); err != nil {
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

func setTags(target **[]string, value string) {
	if value != "" {
		v := strings.Split(value, ",")
		*target = &v
	}
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
