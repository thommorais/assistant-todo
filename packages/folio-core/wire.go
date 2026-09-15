// Package folio wires the hexagon together. A driving adapter needs only the
// App returned here: it holds every use case, already bound to the
// PocketBase-backed repositories.
package folio

import (
	"log/slog"

	pbcore "github.com/pocketbase/pocketbase/core"

	"folio/folio-core/adapters/pb"
	"folio/folio-core/adapters/system"
	"folio/folio-core/ports"
	"folio/folio-core/services"
)

// App is the assembled set of use cases. Driving adapters depend on these
// interfaces, never on the services or repositories behind them.
type App struct {
	Projects ports.ProjectUseCase
	Plans    ports.PlanUseCase
	Tickets  ports.TicketUseCase
	Todos    ports.TodoUseCase
	Journal  ports.JournalUseCase
	Docs     ports.DocUseCase
	Search   ports.SearchUseCase
}

// New builds the use cases against a PocketBase app running in-process.
func New(app pbcore.App, logger *slog.Logger) *App {
	clock := system.Clock{}
	ids := system.IDGenerator{}
	log := system.NewLogger(logger)

	projectRepo := pb.NewProjectRepository(app)
	planRepo := pb.NewPlanRepository(app)
	ticketRepo := pb.NewTicketRepository(app)
	todoRepo := pb.NewTodoRepository(app)
	journalRepo := pb.NewJournalRepository(app)
	docRepo := pb.NewDocRepository(app)
	searchRepo := pb.NewSearchRepository(app)

	guard := services.NewProjectGuard(projectRepo)
	todos := services.NewTodoService(todoRepo, planRepo, ticketRepo, guard, clock, ids, log)

	return &App{
		Projects: services.NewProjectService(projectRepo, guard, clock, ids, log),
		Plans:    services.NewPlanService(planRepo, todoRepo, ticketRepo, todos, guard, clock, ids, log),
		Tickets:  services.NewTicketService(ticketRepo, todoRepo, planRepo, journalRepo, docRepo, guard, clock, ids, log),
		Todos:    todos,
		Journal:  services.NewJournalService(journalRepo, ticketRepo, guard, clock, ids, log),
		Docs:     services.NewDocService(docRepo, ticketRepo, guard, clock, ids, log),
		Search:   services.NewSearchService(searchRepo, guard),
	}
}

// Migrate installs the folio collections. It is idempotent and safe to call
// on every boot.
func Migrate(app pbcore.App) error {
	return pb.Register(app)
}
