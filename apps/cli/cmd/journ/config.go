package main

import (
	"fmt"

	"github.com/spf13/cobra"

	"journ/cli/internal/config"
)

func configCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:    "config",
		Short:  "Inspect CLI configuration",
		Hidden: true,
	}

	// installs scripts ask for this rather than reimplementing
	// os.UserConfigDir, which differs per platform.
	cmd.AddCommand(&cobra.Command{
		Use:   "path",
		Short: "Print where the cached login is stored",
		RunE: func(_ *cobra.Command, _ []string) error {
			path, err := config.Path()
			if err != nil {
				return err
			}
			fmt.Println(path)
			return nil
		},
	})

	return cmd
}
