package httpapi

import (
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase/core"

	"journ/journ-core/domain"
	"journ/journ-core/ports"
)

func (h *Handler) listLogs(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	filter := domain.LogFilter{
		PlanID: domain.PlanID(e.Request.URL.Query().Get("plan_id")),
		TodoID: domain.TodoID(e.Request.URL.Query().Get("todo_id")),
		Branch: e.Request.URL.Query().Get("branch"),
		Ticket: e.Request.URL.Query().Get("ticket"),
		Tags:   csv(e, "tags"),
		Search: e.Request.URL.Query().Get("q"),
		Limit:  queryInt(e, "limit"),
		Offset: queryInt(e, "offset"),
	}
	if since, ok := queryTime(e, "since"); ok {
		filter.Since = since
	}
	if until, ok := queryTime(e, "until"); ok {
		filter.Until = until
	}

	entries, err := h.logs.ListLogs(e.Request.Context(), actorOf(e), project, filter)
	if err != nil {
		return fail(e, err)
	}
	out := make([]logView, 0, len(entries))
	for _, entry := range entries {
		out = append(out, toLogView(entry))
	}
	return e.JSON(http.StatusOK, map[string]any{"logs": out})
}

// queryTime parses an RFC 3339 query parameter, reporting whether one was
// both present and valid. An unparseable value is ignored rather than
// failing the read: a log query should degrade, not 400.
func queryTime(e *core.RequestEvent, key string) (*time.Time, bool) {
	raw := e.Request.URL.Query().Get(key)
	if raw == "" {
		return nil, false
	}
	t, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return nil, false
	}
	return &t, true
}

func (h *Handler) getLog(e *core.RequestEvent) error {
	entry, err := h.logs.GetLog(e.Request.Context(), actorOf(e), domain.LogID(e.Request.PathValue("log")))
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toLogView(entry))
}

type logBody struct {
	PlanID *string         `json:"plan_id"`
	TodoID *string         `json:"todo_id"`
	Title  *string         `json:"title"`
	Body   *string         `json:"body"`
	Branch *string         `json:"branch"`
	PR     *string         `json:"pr"`
	Ticket *string         `json:"ticket"`
	Tags   *[]string       `json:"tags"`
	Meta   *map[string]any `json:"meta"`
}

func (h *Handler) writeLog(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	var body logBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}

	in := ports.WriteLogInput{ProjectID: project}
	if body.PlanID != nil {
		in.PlanID = domain.PlanID(*body.PlanID)
	}
	if body.TodoID != nil {
		in.TodoID = domain.TodoID(*body.TodoID)
	}
	if body.Title != nil {
		in.Title = *body.Title
	}
	if body.Body != nil {
		in.Body = *body.Body
	}
	if body.Branch != nil {
		in.Branch = *body.Branch
	}
	if body.PR != nil {
		in.PR = *body.PR
	}
	if body.Ticket != nil {
		in.Ticket = *body.Ticket
	}
	if body.Tags != nil {
		in.Tags = *body.Tags
	}
	if body.Meta != nil {
		in.Meta = *body.Meta
	}

	entry, err := h.logs.WriteLog(e.Request.Context(), actorOf(e), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusCreated, toLogView(entry))
}

func (h *Handler) updateLog(e *core.RequestEvent) error {
	var body logBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}
	in := ports.UpdateLogInput{
		Title: body.Title, Body: body.Body, Branch: body.Branch,
		PR: body.PR, Ticket: body.Ticket, Tags: body.Tags, Meta: body.Meta,
	}
	if body.PlanID != nil {
		id := domain.PlanID(*body.PlanID)
		in.PlanID = &id
	}
	if body.TodoID != nil {
		id := domain.TodoID(*body.TodoID)
		in.TodoID = &id
	}

	entry, err := h.logs.UpdateLog(e.Request.Context(), actorOf(e), domain.LogID(e.Request.PathValue("log")), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toLogView(entry))
}

type appendLogBody struct {
	Section string `json:"section"`
}

// appendLog adds a section to an existing entry, so recording progress on
// work already written up does not mean resending the whole body.
func (h *Handler) appendLog(e *core.RequestEvent) error {
	var body appendLogBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}
	entry, err := h.logs.AppendToLog(e.Request.Context(), actorOf(e), domain.LogID(e.Request.PathValue("log")), body.Section)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toLogView(entry))
}

func (h *Handler) deleteLog(e *core.RequestEvent) error {
	if err := h.logs.DeleteLog(e.Request.Context(), actorOf(e), domain.LogID(e.Request.PathValue("log"))); err != nil {
		return fail(e, err)
	}
	return e.NoContent(http.StatusNoContent)
}

func (h *Handler) listDocs(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	docs, err := h.docs.ListDocs(e.Request.Context(), actorOf(e), project, domain.DocFilter{
		Tags:   csv(e, "tags"),
		Search: e.Request.URL.Query().Get("q"),
		Limit:  queryInt(e, "limit"),
		Offset: queryInt(e, "offset"),
	})
	if err != nil {
		return fail(e, err)
	}
	out := make([]docView, 0, len(docs))
	for _, d := range docs {
		out = append(out, toDocView(d))
	}
	return e.JSON(http.StatusOK, map[string]any{"docs": out})
}

func (h *Handler) getDoc(e *core.RequestEvent) error {
	doc, err := h.docs.GetDoc(e.Request.Context(), actorOf(e), domain.DocID(e.Request.PathValue("doc")))
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toDocView(doc))
}

func (h *Handler) getDocBySlug(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	doc, err := h.docs.GetDocBySlug(e.Request.Context(), actorOf(e), project, e.Request.PathValue("slug"))
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toDocView(doc))
}

type docBody struct {
	Slug  *string   `json:"slug"`
	Title *string   `json:"title"`
	Body  *string   `json:"body"`
	Tags  *[]string `json:"tags"`
}

func (h *Handler) createDoc(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	var body docBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}

	in := ports.CreateDocInput{ProjectID: project}
	if body.Slug != nil {
		in.Slug = *body.Slug
	}
	if body.Title != nil {
		in.Title = *body.Title
	}
	if body.Body != nil {
		in.Body = *body.Body
	}
	if body.Tags != nil {
		in.Tags = *body.Tags
	}

	doc, err := h.docs.CreateDoc(e.Request.Context(), actorOf(e), in)
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusCreated, toDocView(doc))
}

func (h *Handler) updateDoc(e *core.RequestEvent) error {
	var body docBody
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("invalid request body", err)
	}
	doc, err := h.docs.UpdateDoc(e.Request.Context(), actorOf(e), domain.DocID(e.Request.PathValue("doc")), ports.UpdateDocInput{
		Slug: body.Slug, Title: body.Title, Body: body.Body, Tags: body.Tags,
	})
	if err != nil {
		return fail(e, err)
	}
	return e.JSON(http.StatusOK, toDocView(doc))
}

func (h *Handler) deleteDoc(e *core.RequestEvent) error {
	if err := h.docs.DeleteDoc(e.Request.Context(), actorOf(e), domain.DocID(e.Request.PathValue("doc"))); err != nil {
		return fail(e, err)
	}
	return e.NoContent(http.StatusNoContent)
}

func (h *Handler) searchProject(e *core.RequestEvent) error {
	project, err := h.resolveProject(e)
	if err != nil {
		return fail(e, err)
	}
	query := domain.SearchQuery{
		Text:   e.Request.URL.Query().Get("q"),
		Tags:   csv(e, "tags"),
		Limit:  queryInt(e, "limit"),
		Offset: queryInt(e, "offset"),
	}
	for _, k := range csv(e, "kind") {
		query.Kinds = append(query.Kinds, domain.SearchKind(k))
	}

	hits, err := h.search.Search(e.Request.Context(), actorOf(e), project, query)
	if err != nil {
		return fail(e, err)
	}
	out := make([]searchHitView, 0, len(hits))
	for _, hit := range hits {
		out = append(out, toSearchHitView(hit))
	}
	return e.JSON(http.StatusOK, map[string]any{"hits": out})
}
