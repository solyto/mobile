.PHONY: build build-fdroid sync open run local-api release rerelease clean

# adb from PATH, else the copy Android Studio installs with the SDK.
ADB ?= $(shell command -v adb 2>/dev/null || echo $(HOME)/Android/Sdk/platform-tools/adb)

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

# Debug builds: lets the app on the emulator/device reach the local API as
# http://localhost:8000. Repeat after the emulator restarts.
local-api:
	$(ADB) reverse tcp:8000 tcp:8000

release:
	bash scripts/release.sh

rerelease:
	bash scripts/rerelease.sh

clean:
	rm -rf frontend/build frontend/.svelte-kit frontend/node_modules
