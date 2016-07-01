{{topic}}({{section}}) -- runs unit/functional tests on your application
=============================================

## SYNOPSIS

tibet test [<target>] [--suite <filter>] [--cases <filter>] [--context <app|lib|all>]

## DESCRIPTION

Runs unit, functional, and/or integration tests on your application.

CLI-initiated tests check to see if the `karma-tibet` testing module and `karma`
have been installed in your project. If so the command delegates to `karma
start` to run your tests. If `karma` isn't installed `phantomjs` is checked and
tests will run in the context of `phantomjs` if found.

If you are not using `karma` you can specify a particular test target object or
test suite to run as the first argument to the command. If you need to specify
both a target and suite use `--target` and `--suite` respectively.

Again, outside of `karma` you can limit testing to a particular case or set of
cases by using the `--cases` parameter. Both `--suite` and `--cases` accept
either a string or a regular expression in JavaScript syntax such as `--cases
/foo/i`. Filtering options from the `:test` TSH command are not currently
available when running via karma.

For phantomjs testing output is to the terminal in colorized TAP format by default.
Future versions will support additional test output formatters.

You can use the built-in debugging facilities of PhantomJS by
specifying `--remote-debug-port` and a port number.

## OPTIONS

  * `target` :
    An optional target, usually a type name, to run tests on. Unlike other test
frameworks TIBET's tests are typically associated with an object such as a type.
This lets you quickly test a type by simply specifying it as a `target`.

  * `--cases` :
    A specific case name or a /pattern/ to match to filter case names.

  * `--context` :
    Sets the context of the scan which is run. The default is `app`
which scans only application-level resources, ignoring any potential library
resources. Other values are `lib` and `all`.

  * `--suite` :
    A specific suite name or a /pattern/ to match to filter suite names.

## EXAMPLES

### Run default application tests via karma

Assuming you've followed the installation instructions for `karma-tibet` (https://github.com/TechnicalPursuit/karma-tibet) you can run your karma tests via `tibet test`:

    $ tibet test

    30 06 2016 17:32:46.557:INFO [karma]: Karma v1.1.0 server started at http://0.0.0.0:9876/
    30 06 2016 17:32:46.560:INFO [launcher]: Launching browser Chrome with unlimited concurrency
    30 06 2016 17:32:46.567:INFO [launcher]: Starting browser Chrome
    30 06 2016 17:32:48.803:INFO [Chrome 51.0.2704 (Mac OS X 10.11.5)]: Connected on socket /#i8jwIIkTNAvAF27lAAAA with id 70331982
    Chrome 51.0.2704 (Mac OS X 10.11.5): Executed 3 of 3 SUCCESS (0.169 secs / 0 secs)

### Run default application tests via phantomjs

    $ tibet test

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 17:34:07 MDT
    # TIBET loaded in 2292 ms. Starting execution.
    # TIBET starting test run
    # 2 suite(s) found.
    1..3
    #
    # tibet test APP --suite='APP suite'
    ok - Has a namespace.
    ok - Has an application type.
    # pass: 2 total, 2 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # tibet test APP.d2d.app --suite='APP.d2d:app suite'
    ok - Is a templated tag.
    # pass: 1 total, 1 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # PASS: 3 total, 3 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.

    # Finished in 2385 ms w/TSH exec time of 93 ms.

NOTE that each test is prefixed with a comment of the form `# tibet test ..`
which allows you to run that specific test suite.

### Run a specific test suite

    $ tibet test APP --suite='APP suite'

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 17:38:10 MDT
    # TIBET loaded in 2285 ms. Starting execution.
    # Running Local tests for APP
    # TIBET starting test run
    # 1 suite(s) found
    1..2
    #
    # tibet test APP --suite='APP suite'
    ok - Has a namespace.
    ok - Has an application type.
    # pass: 2 total, 2 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # PASS: 2 total, 2 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    # Finished in 2372 ms w/TSH exec time of 87 ms.


## SEE ALSO


