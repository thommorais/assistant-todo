package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"golang.org/x/term"

	"journ/cli/internal/client"
	"journ/cli/internal/config"
	"journ/cli/internal/tui"
)

func isTerminal(f *os.File) bool {
	return term.IsTerminal(int(f.Fd()))
}

var (
	flagURL     string
	flagToken   string
	flagProject string
	flagJSON    bool
)

func api() (*client.Client, error) {
	cfg, err := config.Resolve(flagURL, flagToken)
	if err != nil {
		return nil, err
	}
	return client.New(cfg.URL, cfg.Token), nil
}

func main() {
	root := &cobra.Command{
		Use:           "journ",
		Short:         "Write to the journ project journal",
		SilenceUsage:  true,
		SilenceErrors: true,
		Args:          cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			// Bare `journ` opens the browser on a terminal, but a pipe or a
			// CI run gets help rather than an alt-screen program it cannot
			// drive.
			if !isTerminal(os.Stdout) {
				return cmd.Help()
			}

			journ, err := api()
			if err != nil {
				return err
			}
			return tui.Run(journ, config.Project(flagProject))
		},
	}

	root.PersistentFlags().StringVarP(&flagProject, "project", "p", "", "project id or slug")

	root.PersistentFlags().StringVar(&flagURL, "url", "", "journ base URL (default $JOURN_URL or "+config.DefaultURL+")")
	root.PersistentFlags().StringVar(&flagToken, "token", "", "auth token (default $JOURN_TOKEN or the cached login)")
	root.PersistentFlags().BoolVar(&flagJSON, "json", false, "output JSON instead of a table")

	root.AddCommand(
		configCommand(),
		docCommand(),
		logCommand(),
		loginCommand(),
		logoutCommand(),
		planCommand(),
		projectCommand(),
		searchCommand(),
		tagsCommand(),
		todoCommand(),
		useCommand(),
	)

	if err := root.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, "journ: "+err.Error())
		os.Exit(1)
	}
}
