.PHONY: build build-fdroid sync open run release rerelease clean

build:
	bash build.sh

build-fdroid:
	bash build-fdroid.sh

sync:
	npx cap sync android

open:
	npx cap open android

run:
	npx cap run android

release:
	bash scripts/release.sh

rerelease:
	bash scripts/rerelease.sh

clean:
	rm -rf build-src/build build-src/.svelte-kit build-src/node_modules
