.PHONY: dhall-format all

all: .github/workflows/test-rust.yml

format-dhall:
	dhall format actions/*

.github/workflows/%.yml: actions/%.dhall
	(cd actions && dhall-to-yaml) < $< > $@
