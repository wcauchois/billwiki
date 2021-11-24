.PHONY: dhall-format all

all: $(shell ls actions | sed 's/\.dhall/\.yml/' | xargs printf '.github/actions/%s\n')

dhall-format:
	dhall format actions/*

.github/actions/%.yml: actions/%.dhall
	dhall-to-yaml < $< > $@
