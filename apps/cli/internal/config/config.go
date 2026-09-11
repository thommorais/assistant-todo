package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const (
	EnvURL   = "JOURN_URL"
	EnvToken = "JOURN_TOKEN"

	DefaultURL = "http://127.0.0.1:8090"
)

var ErrNoToken = errors.New("no token: set " + EnvToken + " or run `journ login`")

type Config struct {
	URL   string
	Token string
}

type cached struct {
	URL   string `json:"url"`
	Token string `json:"token"`
}

func Path() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "journ", "credentials.json"), nil
}

// Precedence: flag, environment, cached login.
func Resolve(urlFlag, tokenFlag string) Config {
	cfg := Config{URL: urlFlag, Token: tokenFlag}

	if cfg.URL == "" {
		cfg.URL = os.Getenv(EnvURL)
	}
	if cfg.Token == "" {
		cfg.Token = os.Getenv(EnvToken)
	}

	if cfg.URL == "" || cfg.Token == "" {
		if stored, err := load(); err == nil {
			if cfg.URL == "" {
				cfg.URL = stored.URL
			}
			if cfg.Token == "" {
				cfg.Token = stored.Token
			}
		}
	}

	if cfg.URL == "" {
		cfg.URL = DefaultURL
	}

	return cfg
}

func load() (cached, error) {
	path, err := Path()
	if err != nil {
		return cached{}, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return cached{}, err
	}
	var out cached
	if err := json.Unmarshal(data, &out); err != nil {
		return cached{}, err
	}
	return out, nil
}

func Save(url, token string) error {
	path, err := Path()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	data, err := json.Marshal(cached{URL: url, Token: token})
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o600)
}
