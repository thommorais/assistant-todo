package client

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type Todo struct {
	ID        string   `json:"id"`
	ProjectID string   `json:"project_id"`
	PlanID    string   `json:"plan_id,omitempty"`
	Title     string   `json:"title"`
	Details   string   `json:"details,omitempty"`
	Status    string   `json:"status"`
	Priority  string   `json:"priority"`
	Tags      []string `json:"tags"`
	Position  int      `json:"position"`
	DependsOn []string `json:"depends_on"`
	DueDate   string   `json:"due_date,omitempty"`
	Blocked   bool     `json:"blocked"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

// Pointers so an unset field is omitted: the API treats an absent field as
// "leave alone" on PATCH and "use the default" on POST, while a zero value
// would clear it.
type TodoInput struct {
	PlanID    *string   `json:"plan_id,omitempty"`
	Title     *string   `json:"title,omitempty"`
	Details   *string   `json:"details,omitempty"`
	Status    *string   `json:"status,omitempty"`
	Priority  *string   `json:"priority,omitempty"`
	Tags      *[]string `json:"tags,omitempty"`
	Position  *int      `json:"position,omitempty"`
	DependsOn *[]string `json:"depends_on,omitempty"`
	DueDate   *string   `json:"due_date,omitempty"`
}

type TodoFilter struct {
	PlanID   string
	Status   []string
	Priority string
	Tags     []string
	Search   string
	Limit    int
	Offset   int
}

func (f TodoFilter) query() string {
	params := url.Values{}
	if f.PlanID != "" {
		params.Set("plan_id", f.PlanID)
	}
	if len(f.Status) > 0 {
		params.Set("status", strings.Join(f.Status, ","))
	}
	if f.Priority != "" {
		params.Set("priority", f.Priority)
	}
	if len(f.Tags) > 0 {
		params.Set("tags", strings.Join(f.Tags, ","))
	}
	if f.Search != "" {
		params.Set("q", f.Search)
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

func (c *Client) ListTodos(project string, filter TodoFilter) ([]Todo, error) {
	var body struct {
		Todos []Todo `json:"todos"`
	}
	if err := c.do(http.MethodGet, "/api/journ/projects/"+project+"/todos"+filter.query(), nil, &body); err != nil {
		return nil, err
	}
	return body.Todos, nil
}

func (c *Client) GetTodo(id string) (Todo, error) {
	var todo Todo
	err := c.do(http.MethodGet, "/api/journ/todos/"+id, nil, &todo)
	return todo, err
}

func (c *Client) CreateTodo(project string, in TodoInput) (Todo, error) {
	var todo Todo
	err := c.do(http.MethodPost, "/api/journ/projects/"+project+"/todos", in, &todo)
	return todo, err
}

func (c *Client) UpdateTodo(id string, in TodoInput) (Todo, error) {
	var todo Todo
	err := c.do(http.MethodPatch, "/api/journ/todos/"+id, in, &todo)
	return todo, err
}

func (c *Client) DeleteTodo(id string) error {
	return c.do(http.MethodDelete, "/api/journ/todos/"+id, nil, nil)
}
