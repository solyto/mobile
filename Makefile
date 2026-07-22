.PHONY: build build-fdroid sync open run release rerelease clean

build:
	bash scripts/build.sh

build-fdroid:
	bash scripts/build-fdroid.sh

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
	rm -rf frontend/build frontend/.svelte-kit frontend/node_modules
