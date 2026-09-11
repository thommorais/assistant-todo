package client

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type Doc struct {
	ID        string   `json:"id"`
	ProjectID string   `json:"project_id"`
	Slug      string   `json:"slug"`
	Title     string   `json:"title"`
	Body      string   `json:"body"`
	Tags      []string `json:"tags"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

type DocInput struct {
	Slug  *string   `json:"slug,omitempty"`
	Title *string   `json:"title,omitempty"`
	Body  *string   `json:"body,omitempty"`
	Tags  *[]string `json:"tags,omitempty"`
}

type DocFilter struct {
	Tags   []string
	Search string
	Limit  int
	Offset int
}

func (f DocFilter) query() string {
	params := url.Values{}
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

func (c *Client) ListDocs(project string, filter DocFilter) ([]Doc, error) {
	var body struct {
		Docs []Doc `json:"docs"`
	}
	if err := c.do(http.MethodGet, "/api/journ/projects/"+project+"/docs"+filter.query(), nil, &body); err != nil {
		return nil, err
	}
	return body.Docs, nil
}

func (c *Client) GetDoc(id string) (Doc, error) {
	var doc Doc
	err := c.do(http.MethodGet, "/api/journ/docs/"+id, nil, &doc)
	return doc, err
}

// GetDocBySlug addresses a doc by its per-project slug, which is how a human
// or an agent refers to one without knowing its id.
func (c *Client) GetDocBySlug(project, slug string) (Doc, error) {
	var doc Doc
	err := c.do(http.MethodGet, "/api/journ/projects/"+project+"/docs/"+slug, nil, &doc)
	return doc, err
}

func (c *Client) CreateDoc(project string, in DocInput) (Doc, error) {
	var doc Doc
	err := c.do(http.MethodPost, "/api/journ/projects/"+project+"/docs", in, &doc)
	return doc, err
}

func (c *Client) UpdateDoc(id string, in DocInput) (Doc, error) {
	var doc Doc
	err := c.do(http.MethodPatch, "/api/journ/docs/"+id, in, &doc)
	return doc, err
}

func (c *Client) DeleteDoc(id string) error {
	return c.do(http.MethodDelete, "/api/journ/docs/"+id, nil, nil)
}
