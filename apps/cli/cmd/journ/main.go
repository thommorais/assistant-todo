package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"journ/cli/internal/client"
	"journ/cli/internal/config"
)

var (
	flagURL     string
	flagToken   string
	flagProject string
	flagJSON    bool
)

func api() *client.Client {
	cfg := config.Resolve(flagURL, flagToken)
	return client.New(cfg.URL, cfg.Token)
}

func main() {
	root := &cobra.Command{
		Use:           "journ",
		Short:         "Write to the journ project journal",
		SilenceUsage:  true,
		SilenceErrors: true,
	}

	root.PersistentFlags().StringVar(&flagURL, "url", "", "journ base URL (default $JOURN_URL or "+config.DefaultURL+")")
	root.PersistentFlags().StringVar(&flagToken, "token", "", "auth token (default $JOURN_TOKEN or the cached login)")
	root.PersistentFlags().BoolVar(&flagJSON, "json", false, "output JSON instead of a table")

	root.AddCommand(configCommand(), loginCommand(), logoutCommand(), todoCommand())

	if err := root.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, "journ: "+err.Error())
		os.Exit(1)
	}
}
