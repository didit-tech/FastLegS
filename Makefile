SHELL := /bin/bash

node-command := xargs -n 1 -I file expresso file

test: setup test-unit test-integration

setup:
	@[ -e ".fastlegz" ] || node test/bootstrap/init.js

test-unit:
	@find test/unit -name "*_test.js" | $(node-command)

test-integration:
	@find test/integration -name "*_test.js" | $(node-command)
