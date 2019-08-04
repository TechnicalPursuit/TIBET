{{topic}}({{section}}) -- runs a TIBET Shell (TSH) expression
=============================================

## SYNOPSIS

tibet tsh [--script=]<command> [<headless_args>]

## DESCRIPTION

Runs the TIBET headless environment to execute a TSH script.

The script to execute is presumed to be the first argument, quoted as
needed to ensure that it can be captured as a single string to pass to
the TIBET Shell. For example: `tibet tsh ':echo "Hello World!"'.`
You can also use the `--script` argument to provide the TSH script.

`<headless_args>` refers to the various flags and parameters you can
provide to Headless Chrome.

## OPTIONS

  * `command` :
    A properly quoted command line for the TSH, escaped as necessary based on
the requirements of your shell.

  * `headless_args`
    Optional arguments to Headless Chrome which is responsible for processing
the script.

  * `--script` :
    An optional argument used to define the `command`.

## CONFIGURATION SETTINGS

  * `project.start_page`:
    The file path to use for the initial page to pass to headless Chrome.

  * `puppeteer.chromium_args`:
    Array of default puppeteer command line arguments. Includes flags to allow
local file access and more flexible security during operation.

  * `puppeteer.devtools`:
    Should puppeteer be run with devtools open? Default is false.

  * `puppeteer.headless`:
    Should puppeteer be run in headless mode? Default is true.

  * `puppeteer.slowMo`:
    Should puppeteer be run in slowMo mode? Default is false.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Run a simple TSH script via the command line

    $ tibet tsh --script=':echo "Hello World!"'

    # Loading TIBET at 2018-08-23T13:32:03.632Z
    # TIBET loaded and active in 6736ms
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

    # Loading TIBET at 2018-08-23T13:32:03.632Z
    # TIBET loaded and active in 6736ms
    # TIBET starting test run
    # 2 suite(s) found.
    1..3
    #
    # tibet test APP --suite='APP'
    ok - Has a namespace.
    ok - Has an application type.
    # pass: 2 total, 2 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # tibet test APP.todomvc.app --suite='APP.todomvc:app'
    ok - Is a templated tag.
    # pass: 1 total, 1 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.
    #
    # PASS: 3 total, 3 pass, 0 fail, 0 error, 0 skip, 0 todo, 0 only.

    Finished in 4209 ms w/TSH exec time of 104 ms.

## TIBET SHELL

This command invokes the client-side TIBET Shell to run a TSH script/command.

## TROUBLESHOOTING


## SEE ALSO
