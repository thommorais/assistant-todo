// Command base is the journ backend: a PocketBase instance that also serves
// the journ REST API. PocketBase owns auth, the admin UI and storage; journ
// adds its collections and the /api/journ routes driven by journ-core.
package main

import (
	"log"
	"os"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	journ "journ/journ-core"
	"journ/journ-core/adapters/httpapi"
)

func main() {
	app := pocketbase.New()

	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: isGoRun,
	})

	// app.RootCmd.AddCommand(newSeedCommand(app))

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		return journ.Migrate(e.App)
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		useCases := journ.New(e.App, nil)
		httpapi.New(httpapi.Deps{
			Projects: useCases.Projects,
			Plans:    useCases.Plans,
			Todos:    useCases.Todos,
			Logs:     useCases.Logs,
			Docs:     useCases.Docs,
			Search:   useCases.Search,
		}).Mount(e)
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
