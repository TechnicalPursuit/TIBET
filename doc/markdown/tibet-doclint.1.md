{{topic}}({{section}}) -- validates method comment content
=============================================

## SYNOPSIS

`tibet doclint [<target>] [--filter <filter>] [--missing] [--tap[=true|false]]
    [--no-tap] [--context=['app'|'lib'|'all']]`

## DESCRIPTION

Runs the TSH `:doclint` command to validate method comment content.

The doclint command uses TIBET reflection to find all methods in your
application that match an optional `<target>` and/or `--filter`. Matched methods
then have their comment text checked for conformance to JSDoc3 and TIBET comment
standards. This check can be a part of an overall quality pass which includes
running `tibet lint` and `tibet test` on your code.

If you provide an optional string parameter it will be used as a target ID which
must resolve via TP.bySystemId. Only methods owned by that target will be
checked.

If you provide a `--filter` the method names themselves will be filtered to
match only the pattern or string provided.

If you specify `--missing` only missing comments will be reported. No additional
checks on content will be performed.

The context (app, lib, or all) is generally defaulted based on any target data
given. For example, using a target of `APP.*` will cause an `app` context while
using a target of `TP.*` will default to a lib context. To use the `all` context
you must specify it explicitly.

By default output from this command follows the 'TAP' format. You can turn that
off using `--tap=false` or `--no-tap`.

Note that because it uses method reflection, not file lists, to drive the checks
when this command outputs file counts they represent the number of unique files
containing matching methods, not a full list of project files. This can be
disconcerting at first if you are used to listings which are built by
file-driven tools.

## OPTIONS

  * `target` :
    An optional target, usually a type name, to check.

  * `--context` :
    Sets the context of the method scan which is run. The default is `app`
which scans only application-level resources, ignoring any potential library
resources. Other values are `lib` and `all`.

  * `--filter` :
    An optional regular expression, expressed in /foo/ig form. This filter will
be applied to fully-qualified method names.

  * `--missing` :
    Optional flag which restricts lint warnings/errors to just missing comments.

  * `--tap` :
    Optional flag to turn on/off TAP formatted output. The default is true.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Checking a specific type for documentation lint

Assume a brand-new project. The application type won't have any methods yet
so an initial test won't find any methods and hence will list no files:

    $ tibet doclint APP.hello.Application

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    # PASS: 0 errors in 0 of 0 files.
    # Finished in 3710 ms w/TSH exec time of 77 ms.

If we add a method but fail to add a proper comment we see different output:

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    not ok - ~app_src/APP.test1.Application.js
    # APP.test1.Application.TypeLocal.test (1) -> [missing comment]
    # FAIL: 1 errors in 1 of 1 files.
    # Finished in 3985 ms w/TSH exec time of 75 ms.

If we then comment our new method we'll see output to that effect:

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    ok - ~app_src/APP.test1.Application.js
    # PASS: 0 errors in 0 of 1 files.

    # Finished in 3698 ms w/TSH exec time of 76 ms.

### Checking your entire application for documentation lint

    $ tibet doclint

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    ok - ~app_src/APP.test1.Application.js
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 2 files.
    # Finished in 10097 ms w/TSH exec time of 6299 ms.

### Checking a specific filtered set of targets for doclint

    $ tibet doclint --filter /app/

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 1 files.
    # Finished in 10435 ms w/TSH exec time of 6723 ms.

Note that you can also do case-insensitive filtering (with `i`) as follows:

    $ tibet doclint --filter /app/i

    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    ok - ~app_src/APP.test1.Application.js
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 2 files.
    # Finished in 10556 ms w/TSH exec time of 6344 ms.

## TIBET SHELL

This command invokes the client-side `:doclint` command, passing all flags and
command line arguments to that command for processing.

Command invocation is done via the `tibet tsh` command machinery, which is
inherited by this command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-lint(1)

