package client

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type LogEntry struct {
	ID        string         `json:"id"`
	ProjectID string         `json:"project_id"`
	PlanID    string         `json:"plan_id,omitempty"`
	TodoID    string         `json:"todo_id,omitempty"`
	Title     string         `json:"title"`
	Body      string         `json:"body"`
	Branch    string         `json:"branch,omitempty"`
	PR        string         `json:"pr,omitempty"`
	Ticket    string         `json:"ticket,omitempty"`
	Meta      map[string]any `json:"meta,omitempty"`
	Tags      []string       `json:"tags"`
	CreatedAt string         `json:"created_at"`
	UpdatedAt string         `json:"updated_at"`
}

type LogInput struct {
	PlanID *string   `json:"plan_id,omitempty"`
	TodoID *string   `json:"todo_id,omitempty"`
	Title  *string   `json:"title,omitempty"`
	Body   *string   `json:"body,omitempty"`
	Branch *string   `json:"branch,omitempty"`
	PR     *string   `json:"pr,omitempty"`
	Ticket *string   `json:"ticket,omitempty"`
	Tags   *[]string `json:"tags,omitempty"`
}

type LogFilter struct {
	PlanID string
	TodoID string
	Branch string
	Ticket string
	Tags   []string
	Search string
	Since  string
	Until  string
	Limit  int
	Offset int
}

func (f LogFilter) query() string {
	params := url.Values{}
	for key, value := range map[string]string{
		"plan_id": f.PlanID,
		"todo_id": f.TodoID,
		"branch":  f.Branch,
		"ticket":  f.Ticket,
		"q":       f.Search,
		"since":   f.Since,
		"until":   f.Until,
	} {
		if value != "" {
			params.Set(key, value)
		}
	}
	if len(f.Tags) > 0 {
		params.Set("tags", strings.Join(f.Tags, ","))
	}
	if f.Limit > 0 {
		params.Set("limit", strconv.Itoa(f.Limit))
	}
	if f.Offset > 0 {
		params.Set("offset", strconv.Itoa(f.Offset))
	}
	if len(params) == 0 {
		return ""
	}
	return "?" + params.Encode()
}

func (c *Client) ListLogs(project string, filter LogFilter) ([]LogEntry, error) {
	var body struct {
		Logs []LogEntry `json:"logs"`
	}
	if err := c.do(http.MethodGet, "/api/journ/projects/"+project+"/logs"+filter.query(), nil, &body); err != nil {
		return nil, err
	}
	return body.Logs, nil
}

func (c *Client) GetLog(id string) (LogEntry, error) {
	var entry LogEntry
	err := c.do(http.MethodGet, "/api/journ/logs/"+id, nil, &entry)
	return entry, err
}

func (c *Client) WriteLog(project string, in LogInput) (LogEntry, error) {
	var entry LogEntry
	err := c.do(http.MethodPost, "/api/journ/projects/"+project+"/logs", in, &entry)
	return entry, err
}

func (c *Client) UpdateLog(id string, in LogInput) (LogEntry, error) {
	var entry LogEntry
	err := c.do(http.MethodPatch, "/api/journ/logs/"+id, in, &entry)
	return entry, err
}

func (c *Client) AppendLog(id, section string) (LogEntry, error) {
	var entry LogEntry
	body := struct {
		Section string `json:"section"`
	}{Section: section}
	err := c.do(http.MethodPost, "/api/journ/logs/"+id+"/append", body, &entry)
	return entry, err
}

func (c *Client) DeleteLog(id string) error {
	return c.do(http.MethodDelete, "/api/journ/logs/"+id, nil, nil)
}
