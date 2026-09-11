package pb

import (
	"context"
	"strconv"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"

	"journ/journ-core/domain"
	"journ/journ-core/ports"
)

type LogRepository struct {
	app core.App
}

func NewLogRepository(app core.App) *LogRepository {
	return &LogRepository{app: app}
}

var _ ports.LogRepository = (*LogRepository)(nil)

func toLogEntry(rec *core.Record) domain.LogEntry {
	return domain.LogEntry{
		ID:          domain.LogID(rec.Id),
		ProjectID:   domain.ProjectID(rec.GetString("project")),
		PlanID:      domain.PlanID(rec.GetString("plan")),
		TodoID:      domain.TodoID(rec.GetString("todo")),
		Title:       rec.GetString("title"),
		Body:        rec.GetString("body"),
		Branch:      rec.GetString("branch"),
		PR:          rec.GetString("pr"),
		TicketID:    domain.TicketID(rec.GetString("ticket")),
		ExternalRef: rec.GetString("external_ref"),
		Meta:        jsonMap(rec, "meta"),
		Tags:        strSlice(rec, "tags"),
		CreatedBy:   domain.UserID(rec.GetString("created_by")),
		CreatedAt:   rec.GetDateTime("created").Time(),
		UpdatedAt:   rec.GetDateTime("updated").Time(),
	}
}

// List returns entries newest first: the recent work is what a reader
// catching up on a project needs first.
func (r *LogRepository) List(ctx context.Context, project domain.ProjectID, f domain.LogFilter) ([]domain.LogEntry, error) {
	filter := []string{"project = {:project}"}
	params := dbx.Params{"project": string(project)}

	if f.PlanID != "" {
		filter = append(filter, "plan = {:plan}")
		params["plan"] = string(f.PlanID)
	}
	if f.TodoID != "" {
		filter = append(filter, "todo = {:todo}")
		params["todo"] = string(f.TodoID)
	}
	if f.Branch != "" {
		filter = append(filter, "branch = {:branch}")
		params["branch"] = f.Branch
	}
	if f.TicketID != "" {
		filter = append(filter, "ticket = {:ticket}")
		params["ticket"] = string(f.TicketID)
	}
	if f.ExternalRef != "" {
		filter = append(filter, "external_ref = {:external_ref}")
		params["external_ref"] = f.ExternalRef
	}
	if q := strings.TrimSpace(f.Search); q != "" {
		filter = append(filter, "(title ~ {:search} || body ~ {:search})")
		params["search"] = q
	}
	for i, tag := range f.Tags {
		key := "tag" + strconv.Itoa(i)
		filter = append(filter, "tags ~ {:"+key+"}")
		params[key] = `"` + tag + `"`
	}
	if f.Since != nil {
		filter = append(filter, "created >= {:since}")
		params["since"] = f.Since.UTC().Format(types.DefaultDateLayout)
	}
	if f.Until != nil {
		filter = append(filter, "created <= {:until}")
		params["until"] = f.Until.UTC().Format(types.DefaultDateLayout)
	}

	records, err := r.app.FindRecordsByFilter(
		ColLogs,
		strings.Join(filter, " && "),
		"-created",
		f.Limit,
		f.Offset,
		params,
	)
	if err != nil {
		return nil, mapErr(err)
	}
	out := make([]domain.LogEntry, 0, len(records))
	for _, rec := range records {
		out = append(out, toLogEntry(rec))
	}
	return out, nil
}

func (r *LogRepository) GetByID(ctx context.Context, id domain.LogID) (domain.LogEntry, error) {
	rec, err := r.app.FindRecordById(ColLogs, string(id))
	if err != nil {
		return domain.LogEntry{}, mapErr(err)
	}
	return toLogEntry(rec), nil
}

func (r *LogRepository) Create(ctx context.Context, e domain.LogEntry) (domain.LogEntry, error) {
	collection, err := r.app.FindCollectionByNameOrId(ColLogs)
	if err != nil {
		return domain.LogEntry{}, mapErr(err)
	}
	rec := core.NewRecord(collection)
	rec.Id = string(e.ID)
	applyLogEntry(rec, e)
	if err := r.app.Save(rec); err != nil {
		return domain.LogEntry{}, mapErr(err)
	}
	return toLogEntry(rec), nil
}

func (r *LogRepository) Update(ctx context.Context, e domain.LogEntry) (domain.LogEntry, error) {
	rec, err := r.app.FindRecordById(ColLogs, string(e.ID))
	if err != nil {
		return domain.LogEntry{}, mapErr(err)
	}
	applyLogEntry(rec, e)
	if err := r.app.Save(rec); err != nil {
		return domain.LogEntry{}, mapErr(err)
	}
	return toLogEntry(rec), nil
}

func applyLogEntry(rec *core.Record, e domain.LogEntry) {
	rec.Set("project", string(e.ProjectID))
	rec.Set("plan", string(e.PlanID))
	rec.Set("todo", string(e.TodoID))
	rec.Set("title", e.Title)
	rec.Set("body", e.Body)
	rec.Set("branch", e.Branch)
	rec.Set("pr", e.PR)
	rec.Set("ticket", string(e.TicketID))
	rec.Set("external_ref", e.ExternalRef)
	setJSON(rec, "meta", e.Meta)
	setJSON(rec, "tags", e.Tags)
	if e.CreatedBy != "" {
		rec.Set("created_by", string(e.CreatedBy))
	}
}

func (r *LogRepository) Delete(ctx context.Context, id domain.LogID) error {
	rec, err := r.app.FindRecordById(ColLogs, string(id))
	if err != nil {
		return mapErr(err)
	}
	return mapErr(r.app.Delete(rec))
}
