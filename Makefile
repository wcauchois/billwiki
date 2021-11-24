.PHONY: dhall-format all clean

actions = test-rust dhall-drift

all: $(addsuffix .yml,$(addprefix .github/workflows/,$(actions)))

clean:
	rm .github/workflows/*.yml

format-dhall:
	dhall format actions/*

.github/workflows/%.yml: actions/%.dhall
	(cd actions && dhall-to-yaml) < $< > $@
