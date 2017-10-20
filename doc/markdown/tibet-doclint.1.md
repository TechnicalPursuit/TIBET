{{topic}}({{section}}) -- validates method comment content
=============================================

## SYNOPSIS

tibet doclint [<target>] [--filter <filter>] [--context <app|lib|all>]

## DESCRIPTION

Runs the TSH `:doclint` command to validate method comment content.

The doclint command uses TIBET reflection to find all methods in your
application and check their comment text for conformance to JSDoc3 and
TIBET comment standards. This check can be a part of an overall quality
pass which includes running `tibet lint` and `tibet test` on your code.

If you provide an optional string parameter it will be used as a target
ID which must resolve via TP.bySystemId. Only methods owned by that target will
be checked.

If you provide a --filter the method names themselves will be filtered to match
only the pattern or string provided.

The context (app, lib, or all) is generally defaulted based on any target data
given. For example, using a target of `APP.*` will cause an `app` context while
using a target of `TP.*` will default to a lib context. To use the `all` context
you must specify it explicitly.

Note that because it uses method reflection, not file lists, to drive
the checks when this command outputs file counts they represent the
number of unique files containing matching methods, not a full list
of project files. This can be disconcerting at first if you are used
to listings which are built by file-driven tools.

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


## EXAMPLES

### Checking a specific type for documentation lint

Assume a brand-new project. The application type won't have any methods yet
so an initial test won't find any methods and hence will list no files:

    $ tibet doclint APP.hello.Application

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:46:13 MDT
    # TIBET loaded in 3633 ms. Starting execution.
    # PASS: 0 errors in 0 of 0 files.
    # Finished in 3710 ms w/TSH exec time of 77 ms.

If we add a method but fail to add a proper comment we see different output:

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:45:44 MDT
    # TIBET loaded in 3910 ms. Starting execution.
    not ok - ~app_src/APP.test1.Application.js
    # APP.test1.Application.TypeLocal.test (1) -> [missing comment]
    # FAIL: 1 errors in 1 of 1 files.
    # Finished in 3985 ms w/TSH exec time of 75 ms.

If we then comment our new method we'll see output to that effect:

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:48:56 MDT
    # TIBET loaded in 3622 ms. Starting execution.
    ok - ~app_src/APP.test1.Application.js
    # PASS: 0 errors in 0 of 1 files.

    # Finished in 3698 ms w/TSH exec time of 76 ms.

### Checking your entire application for documentation lint

    $ tibet doclint

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:48:56 MDT
    # TIBET loaded in 3622 ms. Starting execution.
    ok - ~app_src/APP.test1.Application.js
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 2 files.
    # Finished in 10097 ms w/TSH exec time of 6299 ms.

### Checking a specific filtered set of targets for doclint

    $ tibet doclint --filter /app/

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:57:26 MDT
    # TIBET loaded in 3712 ms. Starting execution.
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 1 files.
    # Finished in 10435 ms w/TSH exec time of 6723 ms.

Note that you can also do case-insensitive filtering (with `i`) as follows:

    $ tibet doclint --filter /app/i

    # Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 12:57:26 MDT
    # TIBET loaded in 4212 ms. Starting execution.
    ok - ~app_src/APP.test1.Application.js
    ok - ~app_tags/APP.test1.app/APP.test1.app.js
    # PASS: 0 errors in 0 of 2 files.
    # Finished in 10556 ms w/TSH exec time of 6344 ms.

## SEE ALSO

  * tibet-lint(1)
