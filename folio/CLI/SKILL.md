---
name: folio-cli
description: How to drive the folio CLI — the `folio` command for projects, tickets, plans, todos, logs and docs. Use when reading or writing anything in a folio workspace, when a task mentions folio tickets/todos/plans/logs/docs, or when `folio` appears in a command.
---

# folio CLI

`folio` is a Go/cobra CLI over the folio HTTP API. Five record kinds live under a
project: **tickets** (units of work, sluggable), **plans** (intent), **todos**
(steps), **logs** (what happened, newest first), **docs** (reference, sluggable).

Run `folio <command> --help` for the current flag list. This skill covers what
help output does not say.

## Before anything else: select a project

Every read and write except `project` and `config` needs a project. Without one
they fail with `no project: pass --project, or select one with: eval "$(folio use <project>)"`.

```bash
eval "$(folio use folio)"   # exports FOLIO_PROJECT for this shell
folio use                   # prints the current selection to stderr
eval "$(folio use --clear)" # unsets it
```

The selection lives in the environment, never on disk, so two terminals can sit
on different projects. `folio use <project>` resolves the reference against the
API before printing, so a typo fails there rather than on the next command.

Per-command override: `-p/--project <id-or-slug>`.

## Authentication

```bash
folio login            # prompts for email and password, caches a token
folio config get       # url, project, token (presence only)
folio config path      # where credentials.json lives
folio config set url https://folio.example.com
```

Precedence for url and token: flag, then environment (`FOLIO_URL`, `FOLIO_TOKEN`),
then the cached login. The cache is taken as a **pair** — the URL and token are
only read together, because a token is valid only for the host that issued it.
Default URL is `http://127.0.0.1:8090`.

`--url` accepts a bare host; loopback gets `http`, anything else `https`.

## Piping and JSON

`--json` is a persistent flag on every command. Use it whenever you are parsing
output — the default is a `tabwriter` table meant for a human.

Bare `folio` on a terminal opens the TUI. In a pipe or CI it prints help
instead, so it is safe to call from a script.

Prose bodies come from stdin with `--body -`:

```bash
folio log write "Cut the 0.4 release" --body - <<'EOF'
Tagged and pushed. The migration ran clean.
EOF
```

`--body -` works on `log write`, `log update`, `doc create`, `doc update`;
`log append --section -` adds to an existing entry without rewriting it.

## Tags are a closed vocabulary

Write commands reject any tag outside the known list, with a spelling
suggestion. Two axes, and a record usually carries one of each:

- **context** (where the work lives): api, backend, cli, db, design, docs, frontend, infra, mcp, mobile, tui, web
- **kind** (what sort of work): bug, chore, decision, deploy, dx, perf, refactor, release, security, spike, test

```bash
folio tags            # tally across todos, plans, logs and docs
folio tags --unused   # also list known tags nothing carries yet
```

A tag marked `*` in that table is not in the vocabulary — it predates the list
or came in through the API directly.

`--tags` on a **write** replaces the whole set, it does not merge. Read the
current tags first if you mean to add one.

`todo create` without `--tags` warns on stderr but succeeds: an untagged todo is
findable only by title. Tag todos you create.

## Reading

`folio ticket brief <id-or-slug>` returns a ticket with its plans, todos, logs
and docs in one call. This is what to run when opening a session on a known
ticket. Todos come back open first, so the next step is the first row; logs are
the 10 most recent, `--recent-logs` overrides.

`folio search` hits logs, docs, todos and plans in one call, newest first, each
hit with a snippet. Reach for it when you do not know where something lives;
reach for `ticket brief` when you already know the ticket.

```bash
folio search "index strategy" --kind log,doc --limit 5 --json
folio search --tags decision
```

List commands take `--query/-q`, `--tags`, `--limit`, `--offset`, and
kind-specific filters (`--status`, `--priority`, `--ticket`, `--plan`,
`--branch`, `--since`, `--until`). `--status` and `--tags` are comma separated.

Status values differ by kind — ticket: `open,in_progress,blocked,closed,cancelled`;
todo: `pending,in_progress,done,blocked,cancelled`; plan: `draft,active,done,abandoned`.

`ticket get` and `doc get` accept an id or a slug, but a **slug only resolves
with a project selected** — it is unique within a project, not globally.

## Writing

`update` is a patch: unset flags are left alone, and passing no field at all is
an error rather than a no-op. `create` takes the title as a positional argument.

```bash
folio ticket create "Mobile nav" --body "No nav below md." --tags frontend,bug
folio todo create "Add the hamburger" --ticket <id> --tags frontend,bug
folio todo update <id> --status done
folio log write "Shipped mobile nav" --branch develop --pr 42 --ticket <id> --tags frontend,release
```

Deletes cascade downward and are not prompted, since an agent cannot answer a
prompt. `ticket delete` detaches its plans, todos, logs and docs.
`project delete` destroys everything under the project and refuses to run
without `--yes`.

## Development

From the repo root: `pnpm cli:build`, `pnpm cli:dev`, `pnpm cli:install`
(builds and installs to `~/.local/bin`, override with `PREFIX`). Inside
`apps/cli` the Makefile has `build`, `test`, `check`, `format`, `clean`.
