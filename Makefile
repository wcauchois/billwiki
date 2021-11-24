.PHONY: dhall-format all clean

all: .github/workflows/test-rust.yml

clean:
	rm .github/workflows/*.yml

format-dhall:
	dhall format actions/*

.github/workflows/%.yml: actions/%.dhall
	(cd actions && dhall-to-yaml) < $< > $@
