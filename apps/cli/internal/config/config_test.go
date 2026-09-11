package config

import "testing"

func TestNormalizeURL(t *testing.T) {
	cases := []struct {
		name  string
		in    string
		want  string
		error bool
	}{
		{name: "leaves an https origin alone", in: "https://journ.example.com", want: "https://journ.example.com"},
		{name: "strips a trailing slash", in: "https://journ.example.com/", want: "https://journ.example.com"},
		{name: "keeps an explicit port", in: "http://127.0.0.1:8090", want: "http://127.0.0.1:8090"},
		{
			name: "assumes https for a bare remote host",
			in:   "journ.example.com",
			want: "https://journ.example.com",
		},
		{
			name: "assumes http for a bare loopback host, which rarely has TLS",
			in:   "127.0.0.1:8090",
			want: "http://127.0.0.1:8090",
		},
		{name: "assumes http for bare localhost", in: "localhost:8090", want: "http://localhost:8090"},
		{
			name: "drops a path, since the client appends its own",
			in:   "https://journ.example.com/api",
			want: "https://journ.example.com",
		},
		{name: "trims surrounding whitespace", in: "  https://journ.example.com  ", want: "https://journ.example.com"},
		{name: "rejects an unsupported scheme", in: "htp://journ.example.com", error: true},
		{name: "rejects a non-http scheme", in: "ftp://journ.example.com", error: true},
		{name: "rejects an empty host", in: "https://", error: true},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := NormalizeURL(c.in)

			if c.error {
				if err == nil {
					t.Fatalf("NormalizeURL(%q) error = nil, want an error", c.in)
				}
				return
			}

			if err != nil {
				t.Fatalf("NormalizeURL(%q) error = %v", c.in, err)
			}
			if got != c.want {
				t.Errorf("NormalizeURL(%q) = %q, want %q", c.in, got, c.want)
			}
		})
	}
}

func TestResolvePrecedence(t *testing.T) {
	t.Setenv(EnvURL, "https://from-env.example.com")
	t.Setenv(EnvToken, "env-token")

	t.Run("the flag beats the environment", func(t *testing.T) {
		cfg, err := Resolve("https://from-flag.example.com", "")
		if err != nil {
			t.Fatalf("Resolve() error = %v", err)
		}
		if cfg.URL != "https://from-flag.example.com" {
			t.Errorf("URL = %q", cfg.URL)
		}
		if cfg.Token != "env-token" {
			t.Errorf("Token = %q, want the environment token", cfg.Token)
		}
	})

	t.Run("the environment is normalized too", func(t *testing.T) {
		t.Setenv(EnvURL, "from-env.example.com/")
		cfg, err := Resolve("", "")
		if err != nil {
			t.Fatalf("Resolve() error = %v", err)
		}
		if cfg.URL != "https://from-env.example.com" {
			t.Errorf("URL = %q, want the normalized environment URL", cfg.URL)
		}
	})

	t.Run("a malformed URL is reported rather than sent", func(t *testing.T) {
		if _, err := Resolve("htp://nope.example.com", ""); err == nil {
			t.Fatal("Resolve() error = nil, want an error for a bad scheme")
		}
	})
}

// A token is only valid for the host that issued it, so the cache must be
// taken as a pair. Mixing a cached URL with an environment token sends a
// credential to a server that never issued it, which reads as a 401 far from
// its cause.
func TestResolveNeverMixesACachedURLWithAnotherToken(t *testing.T) {
	t.Setenv(EnvURL, "")
	t.Setenv(EnvToken, "token-from-env")
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())

	if err := Save("https://remote.example.com", "token-from-remote"); err != nil {
		t.Fatalf("Save() error = %v", err)
	}

	cfg, err := Resolve("", "")
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}

	if cfg.Token == "token-from-env" && cfg.URL == "https://remote.example.com" {
		t.Error("paired a cached remote URL with the environment token")
	}
	if cfg.URL != DefaultURL {
		t.Errorf("URL = %q, want the default once a token comes from elsewhere", cfg.URL)
	}
}

func TestResolveUsesBothHalvesOfTheCacheTogether(t *testing.T) {
	t.Setenv(EnvURL, "")
	t.Setenv(EnvToken, "")
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())

	if err := Save("https://remote.example.com", "token-from-remote"); err != nil {
		t.Fatalf("Save() error = %v", err)
	}

	cfg, err := Resolve("", "")
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}
	if cfg.URL != "https://remote.example.com" || cfg.Token != "token-from-remote" {
		t.Errorf("got %q / %q, want the cached pair", cfg.URL, cfg.Token)
	}
}

func TestResolveFallsBackToTheDefault(t *testing.T) {
	t.Setenv(EnvURL, "")
	t.Setenv(EnvToken, "tok")

	cfg, err := Resolve("", "")
	if err != nil {
		t.Fatalf("Resolve() error = %v", err)
	}
	if cfg.URL != DefaultURL {
		t.Errorf("URL = %q, want %q", cfg.URL, DefaultURL)
	}
}
