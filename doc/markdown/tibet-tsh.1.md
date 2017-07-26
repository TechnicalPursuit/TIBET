{{topic}}({{section}}) -- runs a TIBET Shell (TSH) expression
=============================================

## SYNOPSIS

tibet tsh [--script=]<command> [<phantomtsh_args>]

## DESCRIPTION

Runs the TIBET `phantomtsh` script runner to execute a TSH script.

The script to execute is presumed to be the first argument, quoted as
needed to ensure that it can be captured as a single string to pass to
the TIBET Shell. For example: `tibet tsh ':echo "Hello World!"'.`
You can also use the `--script` argument to provide the TSH script.

`<phantomtsh_args>` refers to the various flags and paramters you can
provide to TIBET's `phantomtsh.js` script. See `tibet help phantomtsh`.

## OPTIONS

  * `command` :
    A properly quoted command line for the TSH, escaped as necessary based on
the requirements of your shell.

  * `phantomtsh_args`
    Optional arguments to TIBET's `phantomtsh.js` script which is responsible
for processing all PhantomJS-based execution of TIBET. See `tibet help
phantomtsh` for details.

  * `--script` :
    An optional argument used to define the `command`.

## EXAMPLES

### Run a simple TSH script via the command line

    $ tibet tsh --script=':echo "Hello World!"'

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 17:55:53 MDT
    TIBET loaded in 4094 ms. Starting execution.
    {
        "ARGV": ["Hello World!"],
        "ARG0": "Hello World!"
    }
    Finished in 4173 ms w/TSH exec time of 79 ms.

### Run a more complex TSH script via the command line

In the example below we run the TSH `:test` command via the `tsh` command line
tool. As it turns out, this is exactly what the `tibet test` command does. The
`tibet test` command is actually a subtype of the `tsh` command.

    $ tibet tsh --script ':test'

    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 17:58:13 MDT
    TIBET loaded in 4105 ms. Starting execution.
    # TIBET starting test run
    # 2 suite(s) found.
    1..3
    #
    # tibet test APP --suite='APP suite'
    ok - Has a namespace.
    ok - Has an application type.
    # pass: 2 total, 2 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # tibet test APP.todomvc.app --suite='APP.todomvc:app suite'
    ok - Is a templated tag.
    # pass: 1 total, 1 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # PASS: 3 total, 3 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.

    Finished in 4209 ms w/TSH exec time of 104 ms.

## SEE ALSO

  * tibet-phantomtsh(1)
