// Command base is the journ backend: a PocketBase instance that also serves
// the journ REST API. PocketBase owns auth, the admin UI and storage; journ
// adds its collections and the /api/journ routes driven by journ-core.
package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
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

	app.RootCmd.AddCommand(newSeedCommand(app))

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
			Tickets:  useCases.Tickets,
			Todos:    useCases.Todos,
			Logs:     useCases.Logs,
			Docs:     useCases.Docs,
			Search:   useCases.Search,
		}).Mount(e)

		// Serve the built SPA when a directory is configured. Registered last
		// so /api and /_ win, and with indexFallback so a deep link like
		// /journ/todos reaches the client router instead of 404ing.
		if dir := publicDir(); dir != "" {
			e.Router.GET("/{path...}", apis.Static(os.DirFS(dir), true))
		}

		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// publicDir returns the directory the static SPA is served from. In production
// the nina-spa build is copied next to the binary as pb_public; PB_PUBLIC_DIR
// overrides this (e.g. a mounted path on Railway).
func publicDir() string {
	if dir := os.Getenv("PB_PUBLIC_DIR"); dir != "" {
		return dir
	}
	// Under `go run`, os.Args[0] is a temp binary, so resolve relative to the
	// working directory instead of the (temp) binary location.
	dir := filepath.Join(filepath.Dir(os.Args[0]), "pb_public")
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		dir = "./pb_public"
	}

	// An absent directory means the API is being run without a frontend
	// build. Returning "" leaves the catch-all route unregistered, rather
	// than answering every unmatched path with a 404 from an empty FS.
	if info, err := os.Stat(dir); err != nil || !info.IsDir() {
		return ""
	}
	return dir
}
