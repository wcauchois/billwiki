.PHONY: dhall-format all

all: $(shell ls actions | sed 's/\.dhall/\.yml/' | xargs printf '.github/workflows/%s\n')

dhall-format:
	dhall format actions/*

.github/workflows/%.yml: actions/%.dhall
	dhall-to-yaml < $< > $@
