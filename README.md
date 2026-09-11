# journ

A project journal a code agent can write to: plans, todos, work logs and docs,
scoped per project, reachable from any client.

One Go core (`packages/journ-core`) holds the domain and use cases. PocketBase
(`apps/base`) provides storage, auth and the admin UI, and serves the REST API.
An MCP server, CLI or web app mounts the same use cases rather than
reimplementing the rules.

## Layout

| Path | What it is |
| --- | --- |
| `packages/journ-core` | Domain, ports, services and adapters (Go). |
| `apps/base` | PocketBase backend serving `/api/journ`. |
| `apps/site` | Next.js web app. |
| `apps/docs` | API contracts. |

## Running

```bash
pnpm install
cd apps/base && go run . serve
```

PocketBase comes up on `:8090`, installs the journ collections on boot and
mounts the API at `/api/journ`. Create the first superuser at
`http://127.0.0.1:8090/_/`, then register users through PocketBase's own auth
endpoints.

```bash
cd packages/journ-core && go test ./...
```

## Demo data

```bash
cd apps/base && go run . seed
```

Creates `user@test.com` / `pass@test` and fills the journal with two projects
mid-flight: plans with real progress, todos in several states, and work logs
carrying actual decisions. It refuses to run against a database that already
has projects (`--force` overrides).

The seed drives the use cases rather than writing records, so it exercises the
same validation and permission checks as any client.

## Model

A **project** has **members** (owner, editor, viewer) and always keeps at
least one owner. Under it sit **plans** (stated intent), **todos** (the
steps), **logs** (what was built, how, and where it stands) and **docs**
(durable knowledge). Search spans all four.

Permissions are checked in the service layer, so every client gets the same
rules; PocketBase collection rules enforce the same tenancy for direct REST
access.

## Docs

- [API](apps/docs/journ-api.md)
- [Core architecture](packages/journ-core/README.md)
