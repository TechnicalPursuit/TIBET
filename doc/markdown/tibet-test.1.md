{{topic}}({{section}}) -- runs unit/functional tests on your application
=============================================

## SYNOPSIS

    tibet test [<target>]

## DESCRIPTION

Runs unit, functional, and/or integration tests on your application.

CLI-initiated tests are run in the context of phantomjs and support
the use of the full TIBET test harness and UI driver feature set.

The default operation makes use of ~app\_test/phantom.xml as the
boot.profile (which controls what code is loaded) and a TSH shell
command of ':test' which will run all test suites in the profile.

You can specify a particular test target object or test suite to
run as the first argument to the command. If you need to specify
both a target and suite use --target and --suite respectively.

You can limit testing to a particular case or set of cases by using
the --cases parameter. Both --suite and --cases accept either a string
or a regular expression in JavaScript syntax such as --cases="/foo/i".

Output is to the terminal in colorized TAP format by default.
Future versions will support additional test output formatters.

You can use the built-in debugging facilities of PhantomJS by
specifying --remote-debug-port and a port number.

