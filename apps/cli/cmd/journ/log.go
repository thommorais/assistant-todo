package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"

	"journ/cli/internal/client"
)

func bodyFrom(value string) (string, error) {
	if value != "-" {
		return value, nil
	}
	piped, err := io.ReadAll(os.Stdin)
	if err != nil {
		return "", err
	}
	return string(piped), nil
}

func logCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "log",
		Short:   "Write and read work log entries",
		Aliases: []string{"logs"},
	}

	cmd.PersistentFlags().StringVarP(&flagProject, "project", "p", "", "project id or slug")
	cmd.AddCommand(
		logListCommand(),
		logGetCommand(),
		logWriteCommand(),
		logUpdateCommand(),
		logAppendCommand(),
		logDeleteCommand(),
	)

	return cmd
}

func logListCommand() *cobra.Command {
	var filter client.LogFilter
	var tags string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List a project's log entries, newest first",
		RunE: func(_ *cobra.Command, _ []string) error {
			project, err := resolveProject()
			if err != nil {
				return err
			}
			if tags != "" {
				filter.Tags = strings.Split(tags, ",")
			}

			journ, err := api()
			if err != nil {
				return err
			}

			entries, err := journ.ListLogs(project, filter)
			if err != nil {
				return err
			}
			return renderLogs(entries)
		},
	}

	cmd.Flags().StringVar(&filter.Branch, "branch", "", "entries anchored to this branch")
	cmd.Flags().StringVar(&filter.Ticket, "ticket", "", "entries anchored to this ticket")
	cmd.Flags().StringVar(&filter.PlanID, "plan", "", "entries under this plan")
	cmd.Flags().StringVar(&filter.TodoID, "todo", "", "entries under this todo")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")
	cmd.Flags().StringVarP(&filter.Search, "query", "q", "", "match the title and body")
	cmd.Flags().StringVar(&filter.Since, "since", "", "RFC 3339 lower bound")
	cmd.Flags().StringVar(&filter.Until, "until", "", "RFC 3339 upper bound")
	cmd.Flags().IntVar(&filter.Limit, "limit", 0, "maximum rows")
	cmd.Flags().IntVar(&filter.Offset, "offset", 0, "rows to skip")

	return cmd
}

func logGetCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "get <id>",
		Short: "Show one entry with its body",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			entry, err := journ.GetLog(args[0])
			if err != nil {
				return err
			}
			if flagJSON {
				return encode(entry)
			}
			return renderLogDetail(entry)
		},
	}
}

func logWriteCommand() *cobra.Command {
	var body, branch, pr, ticket, plan, todo, tags string

	cmd := &cobra.Command{
		Use:   "write <title>",
		Short: "Write a log entry, with --body - to read markdown from stdin",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			project, err := resolveProject()
			if err != nil {
				return err
			}

			text, err := bodyFrom(body)
			if err != nil {
				return err
			}

			in := client.LogInput{Title: &args[0]}
			setIf(&in.Body, text)
			setIf(&in.Branch, branch)
			setIf(&in.PR, pr)
			setIf(&in.Ticket, ticket)
			setIf(&in.PlanID, plan)
			setIf(&in.TodoID, todo)
			setTags(&in.Tags, tags)

			journ, err := api()
			if err != nil {
				return err
			}

			entry, err := journ.WriteLog(project, in)
			if err != nil {
				return err
			}
			return renderLog(entry)
		},
	}

	cmd.Flags().StringVar(&body, "body", "", "markdown body, or - for stdin")
	cmd.Flags().StringVar(&branch, "branch", "", "git branch")
	cmd.Flags().StringVar(&pr, "pr", "", "pull request number")
	cmd.Flags().StringVar(&ticket, "ticket", "", "ticket reference")
	cmd.Flags().StringVar(&plan, "plan", "", "plan this documents")
	cmd.Flags().StringVar(&todo, "todo", "", "todo this documents")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")

	return cmd
}

func logUpdateCommand() *cobra.Command {
	var title, body, branch, pr, ticket, tags string

	cmd := &cobra.Command{
		Use:   "update <id>",
		Short: "Update an entry, leaving unset fields alone",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			text, err := bodyFrom(body)
			if err != nil {
				return err
			}

			in := client.LogInput{}
			setIf(&in.Title, title)
			setIf(&in.Body, text)
			setIf(&in.Branch, branch)
			setIf(&in.PR, pr)
			setIf(&in.Ticket, ticket)
			setTags(&in.Tags, tags)

			if in == (client.LogInput{}) {
				return errors.New("nothing to update: pass at least one field")
			}

			journ, err := api()
			if err != nil {
				return err
			}

			entry, err := journ.UpdateLog(args[0], in)
			if err != nil {
				return err
			}
			return renderLog(entry)
		},
	}

	cmd.Flags().StringVar(&title, "title", "", "new title")
	cmd.Flags().StringVar(&body, "body", "", "replace the body, or - for stdin")
	cmd.Flags().StringVar(&branch, "branch", "", "git branch")
	cmd.Flags().StringVar(&pr, "pr", "", "pull request number")
	cmd.Flags().StringVar(&ticket, "ticket", "", "ticket reference")
	cmd.Flags().StringVar(&tags, "tags", "", "replace the tags, comma separated")

	return cmd
}

func logAppendCommand() *cobra.Command {
	var section string

	cmd := &cobra.Command{
		Use:   "append <id>",
		Short: "Append a section to an entry's body",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			text, err := bodyFrom(section)
			if err != nil {
				return err
			}
			if strings.TrimSpace(text) == "" {
				return errors.New("--section is required (use - to read stdin)")
			}

			journ, err := api()
			if err != nil {
				return err
			}

			entry, err := journ.AppendLog(args[0], text)
			if err != nil {
				return err
			}
			return renderLog(entry)
		},
	}

	cmd.Flags().StringVar(&section, "section", "", "markdown to append, or - for stdin")

	return cmd
}

func logDeleteCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a log entry",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			if err := journ.DeleteLog(args[0]); err != nil {
				return err
			}
			if !flagJSON {
				fmt.Println("deleted " + args[0])
			}
			return nil
		},
	}
}

func renderLog(entry client.LogEntry) error {
	if flagJSON {
		return encode(entry)
	}
	return renderLogs([]client.LogEntry{entry})
}

func renderLogs(entries []client.LogEntry) error {
	if flagJSON {
		return encode(entries)
	}

	if len(entries) == 0 {
		fmt.Println("no log entries")
		return nil
	}

	out := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	fmt.Fprintln(out, "ID\tDATE\tBRANCH\tTITLE\tTAGS")
	for _, entry := range entries {
		date := entry.CreatedAt
		if len(date) >= 10 {
			date = date[:10]
		}
		fmt.Fprintf(out, "%s\t%s\t%s\t%s\t%s\n", entry.ID, date, entry.Branch, entry.Title, strings.Join(entry.Tags, ","))
	}
	return out.Flush()
}

func renderLogDetail(entry client.LogEntry) error {
	fmt.Println(entry.Title)
	fmt.Println(strings.Repeat("=", len(entry.Title)))

	for label, value := range map[string]string{"branch": entry.Branch, "pr": entry.PR, "ticket": entry.Ticket} {
		if value != "" {
			fmt.Printf("%s: %s\n", label, value)
		}
	}
	if len(entry.Tags) > 0 {
		fmt.Printf("tags: %s\n", strings.Join(entry.Tags, ", "))
	}

	if entry.Body != "" {
		fmt.Printf("\n%s\n", entry.Body)
	}
	return nil
}
