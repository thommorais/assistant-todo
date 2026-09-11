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

func docCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "doc",
		Short:   "Create, read, update and delete docs",
		Aliases: []string{"docs"},
	}

	cmd.PersistentFlags().StringVarP(&flagProject, "project", "p", "", "project id or slug")
	cmd.AddCommand(docListCommand(), docGetCommand(), docCreateCommand(), docUpdateCommand(), docDeleteCommand())

	return cmd
}

func docListCommand() *cobra.Command {
	var filter client.DocFilter
	var tags string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List a project's docs",
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

			docs, err := journ.ListDocs(project, filter)
			if err != nil {
				return err
			}
			return renderDocs(docs)
		},
	}

	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")
	cmd.Flags().StringVarP(&filter.Search, "query", "q", "", "match the title and body")
	cmd.Flags().IntVar(&filter.Limit, "limit", 0, "maximum rows")
	cmd.Flags().IntVar(&filter.Offset, "offset", 0, "rows to skip")

	return cmd
}

func docGetCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "get <id-or-slug>",
		Short: "Show one doc with its body; a slug needs --project",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			// A slug is unique only within a project, so a slug needs the
			// project route; ids resolve without one.
			get := journ.GetDoc
			if project := config.Project(flagProject); project != "" {
				get = func(ref string) (client.Doc, error) {
					return journ.GetDocBySlug(project, ref)
				}
			}

			doc, err := get(args[0])
			if err != nil {
				return err
			}
			if flagJSON {
				return encode(doc)
			}
			return renderDocDetail(doc)
		},
	}
}

func docCreateCommand() *cobra.Command {
	var slug, body, tags string

	cmd := &cobra.Command{
		Use:   "create <title>",
		Short: "Create a doc, with --body - to read markdown from stdin",
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

			in := client.DocInput{Title: &args[0]}
			setIf(&in.Slug, slug)
			setIf(&in.Body, text)
			setTags(&in.Tags, tags)

			journ, err := api()
			if err != nil {
				return err
			}

			doc, err := journ.CreateDoc(project, in)
			if err != nil {
				return err
			}
			return renderDoc(doc)
		},
	}

	cmd.Flags().StringVar(&slug, "slug", "", "derived from the title when omitted")
	cmd.Flags().StringVar(&body, "body", "", "markdown body, or - for stdin")
	cmd.Flags().StringVar(&tags, "tags", "", "comma separated tags")

	return cmd
}

func docUpdateCommand() *cobra.Command {
	var title, slug, body, tags string

	cmd := &cobra.Command{
		Use:   "update <id>",
		Short: "Update a doc, leaving unset fields alone",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			text, err := bodyFrom(body)
			if err != nil {
				return err
			}

			in := client.DocInput{}
			setIf(&in.Title, title)
			setIf(&in.Slug, slug)
			setIf(&in.Body, text)
			setTags(&in.Tags, tags)

			if in == (client.DocInput{}) {
				return errors.New("nothing to update: pass at least one field")
			}

			journ, err := api()
			if err != nil {
				return err
			}

			doc, err := journ.UpdateDoc(args[0], in)
			if err != nil {
				return err
			}
			return renderDoc(doc)
		},
	}

	cmd.Flags().StringVar(&title, "title", "", "new title")
	cmd.Flags().StringVar(&slug, "slug", "", "new slug")
	cmd.Flags().StringVar(&body, "body", "", "replace the body, or - for stdin")
	cmd.Flags().StringVar(&tags, "tags", "", "replace the tags, comma separated")

	return cmd
}

func docDeleteCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "delete <id>",
		Short: "Delete a doc",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			journ, err := api()
			if err != nil {
				return err
			}

			if err := journ.DeleteDoc(args[0]); err != nil {
				return err
			}
			if !flagJSON {
				fmt.Println("deleted " + args[0])
			}
			return nil
		},
	}
}

func renderDoc(doc client.Doc) error {
	if flagJSON {
		return encode(doc)
	}
	return renderDocs([]client.Doc{doc})
}

func renderDocs(docs []client.Doc) error {
	if flagJSON {
		return encode(docs)
	}

	if len(docs) == 0 {
		fmt.Println("no docs")
		return nil
	}

	out := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	fmt.Fprintln(out, "ID\tSLUG\tTITLE\tTAGS")
	for _, doc := range docs {
		fmt.Fprintf(out, "%s\t%s\t%s\t%s\n", doc.ID, doc.Slug, doc.Title, strings.Join(doc.Tags, ","))
	}
	return out.Flush()
}

func renderDocDetail(doc client.Doc) error {
	fmt.Println(doc.Title)
	fmt.Println(strings.Repeat("=", len(doc.Title)))
	fmt.Printf("slug: %s\n", doc.Slug)
	if len(doc.Tags) > 0 {
		fmt.Printf("tags: %s\n", strings.Join(doc.Tags, ", "))
	}
	if doc.Body != "" {
		fmt.Printf("\n%s\n", doc.Body)
	}
	return nil
}
