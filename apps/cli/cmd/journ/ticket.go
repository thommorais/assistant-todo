package main

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/spf13/cobra"

	"journ/cli/internal/client"
	"journ/cli/internal/config"
)

func ticketCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "ticket",
		Short:   "Create, read, update and delete tickets",
		Aliases: []string{"tickets"},
	}

	cmd.PersistentFlags().StringVarP(&flagProject, "project", "p", "", "project id or slug")
	cmd.AddCommand(
		ticketListCommand(), ticketGetCommand(), ticketCreateCommand(),
		ticketUpdateCommand(), ticketDeleteCommand(),
	)

	return cmd
}

func ticketListCommand() *cobra.Command {
	var filter client.TicketFilter
	var status, tags string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List a project's tickets",
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

			journ, err := api()
			if err != nil {
				return err
			}

			tickets, err := journ.ListTickets(project, filter)
			if err != nil {
				return err
			}
			return renderTickets(tickets)
		},
	}

	cmd.Flags().StringVar(&status, "status", "", "comma separated: open,in_progress,blocked,closed,cancelled")
	cmd.Flags().StringVar(&filter.Priority, "priority", "", "low, medium or high")
	cmd.Flags().StringVar(&filter.Assignee, "assignee", "", "user id")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")
	registerTagCompletion(cmd)
	cmd.Flags().StringVarP(&filter.Search, "query", "q", "", "match the title and body")
	cmd.Flags().IntVar(&filter.Limit, "limit", 0, "maximum rows")
	cmd.Flags().IntVar(&filter.Offset, "offset", 0, "rows to skip")

	return cmd
}

func ticketGetCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "get <id-or-slug>",
		Short: "Show one ticket with its body; a slug needs --project",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			// A slug is unique only within a project, so a slug needs the
			// project route; ids resolve without one.
			get := journ.GetTicket
			if project := config.Project(flagProject); project != "" {
				get = func(ref string) (client.Ticket, error) {
					return journ.GetTicketBySlug(project, ref)
				}
			}

			ticket, err := get(args[0])
			if err != nil {
				return err
			}
			if flagJSON {
				return encode(ticket)
			}
			return renderTicketDetail(ticket)
		},
	}
}

func ticketCreateCommand() *cobra.Command {
	var slug, body, status, priority, assignee, externalRef, tags string

	cmd := &cobra.Command{
		Use:   "create <title>",
		Short: "Create a ticket",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			project, err := resolveProject()
			if err != nil {
				return err
			}

			in := client.TicketInput{Title: &args[0]}
			setIf(&in.Slug, slug)
			setIf(&in.Body, body)
			setIf(&in.Status, status)
			setIf(&in.Priority, priority)
			setIf(&in.Assignee, assignee)
			setIf(&in.ExternalRef, externalRef)
			if err := setTags(&in.Tags, tags); err != nil {
				return err
			}

			journ, err := api()
			if err != nil {
				return err
			}

			ticket, err := journ.CreateTicket(project, in)
			if err != nil {
				return err
			}
			return renderTicket(ticket)
		},
	}

	cmd.Flags().StringVar(&slug, "slug", "", "defaults to a slug derived from the title")
	cmd.Flags().StringVar(&body, "body", "", "what the ticket is about")
	cmd.Flags().StringVar(&status, "status", "", "defaults to open")
	cmd.Flags().StringVar(&priority, "priority", "", "low, medium or high; defaults to medium")
	cmd.Flags().StringVar(&assignee, "assignee", "", "user id")
	cmd.Flags().StringVar(&externalRef, "external-ref", "", "key in another tracker, e.g. JIRA-123")
	cmd.Flags().StringVar(&tags, "tags", "", tagHelp())
	registerTagCompletion(cmd)

	return cmd
}

func ticketUpdateCommand() *cobra.Command {
	var slug, title, body, status, priority, assignee, externalRef, tags string

	cmd := &cobra.Command{
		Use:   "update <id>",
		Short: "Update a ticket, leaving unset fields alone",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			in := client.TicketInput{}
			setIf(&in.Slug, slug)
			setIf(&in.Title, title)
			setIf(&in.Body, body)
			setIf(&in.Status, status)
			setIf(&in.Priority, priority)
			setIf(&in.Assignee, assignee)
			setIf(&in.ExternalRef, externalRef)
			if err := setTags(&in.Tags, tags); err != nil {
				return err
			}

			if in == (client.TicketInput{}) {
				return errors.New("nothing to update: pass at least one field")
			}

			journ, err := api()
			if err != nil {
				return err
			}

			ticket, err := journ.UpdateTicket(args[0], in)
			if err != nil {
				return err
			}
			return renderTicket(ticket)
		},
	}

	cmd.Flags().StringVar(&slug, "slug", "", "new slug")
	cmd.Flags().StringVar(&title, "title", "", "new title")
	cmd.Flags().StringVar(&body, "body", "", "new body")
	cmd.Flags().StringVar(&status, "status", "", "open, in_progress, blocked, closed or cancelled")
	cmd.Flags().StringVar(&priority, "priority", "", "low, medium or high")
	cmd.Flags().StringVar(&assignee, "assignee", "", "user id")
	cmd.Flags().StringVar(&externalRef, "external-ref", "", "key in another tracker")
	cmd.Flags().StringVar(&tags, "tags", "", "replace the tags; "+tagHelp())
	registerTagCompletion(cmd)

	return cmd
}

func ticketDeleteCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a ticket, detaching its plans, todos, logs and docs",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			if err := journ.DeleteTicket(args[0]); err != nil {
				return err
			}
			if !flagJSON {
				fmt.Println("deleted " + args[0])
			}
			return nil
		},
	}
}

func renderTicket(ticket client.Ticket) error {
	if flagJSON {
		return encode(ticket)
	}
	return renderTickets([]client.Ticket{ticket})
}

func renderTickets(tickets []client.Ticket) error {
	if flagJSON {
		return encode(tickets)
	}

	if len(tickets) == 0 {
		fmt.Println("no tickets")
		return nil
	}

	out := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	fmt.Fprintln(out, "ID\tSLUG\tSTATUS\tPRIORITY\tPROGRESS\tTITLE\tTAGS")
	for _, ticket := range tickets {
		progress := fmt.Sprintf("%d/%d (%d%%)", ticket.Progress.Done, ticket.Progress.Total, ticket.Progress.Percent)
		fmt.Fprintf(out, "%s\t%s\t%s\t%s\t%s\t%s\t%s\n",
			ticket.ID, ticket.Slug, ticket.Status, ticket.Priority,
			progress, ticket.Title, strings.Join(ticket.Tags, ","))
	}
	return out.Flush()
}

func renderTicketDetail(ticket client.Ticket) error {
	fmt.Println(ticket.Title)
	fmt.Printf("%s  %s  %s  %d/%d done\n",
		ticket.ID, ticket.Status, ticket.Priority, ticket.Progress.Done, ticket.Progress.Total)

	for label, value := range map[string]string{"assignee": ticket.Assignee, "external ref": ticket.ExternalRef} {
		if value != "" {
			fmt.Printf("%s: %s\n", label, value)
		}
	}
	if len(ticket.Tags) > 0 {
		fmt.Println("tags: " + strings.Join(ticket.Tags, ", "))
	}
	if ticket.Body != "" {
		fmt.Println()
		fmt.Println(ticket.Body)
	}
	return nil
}
