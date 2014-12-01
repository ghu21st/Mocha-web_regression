REPORTER=spec
MOCHA=/usr/src/node_modules/.bin/mocha

test:
	-@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) --ui bdd QA_TEST/ --timeout 3600s --slow 60000

test-sample:
	-@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) --ui bdd test_sample/ --timeout 3600s --slow 60000

test-w:
	-@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--growl \ --watch

xunit:
	-@# check if reports folder exists, if not create it
	-@test -d reports || mkdir reports
	-XUNIT_FILE="reports/TEST-xunit.xml" $(MOCHA) -R xunit-file --ui bdd QA_TEST/ --timeout 3600s --slow 60000

xunit-sample:
	-@# check if reports folder exists, if not creat it
	-@test -d test_sample/reports || mkdir test_sample/reports
	-XUNIT_FILE="test_sample/reports/TEST-xunit.xml" $(MOCHA) -R xunit-file --ui bdd test_sample/ \
		--timeout 3600s --slow 60000

.PHONY: test test-w xunit test-sample xunit-sample
