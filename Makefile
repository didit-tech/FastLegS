SHELL := /bin/bash

node-command := xargs -n 1 -I file expresso file

test: test-unit test-integration

test-unit:
	@find test/unit -name "*_test.js" | $(node-command)

test-integration:
	@find test/integration -name "*_test.js" | $(node-command)
