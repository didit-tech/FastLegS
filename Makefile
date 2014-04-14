SHELL := /bin/bash

file=*.test.js
unit_files=`find test/unit -name '$(file)' -type f -print0 | xargs -0 echo`
integration_files=`find test/integration -name '$(file)' -type f -print0 | xargs -0 echo`

test: setup test-unit test-integration

setup:
	@[ -e ".fastlegs_pg" ] || node test/bootstrap/init_pg.js

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		$(unit_files)

test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		$(integration_files)
