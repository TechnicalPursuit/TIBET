{{topic}}({{section}}) -- echo command line arguments to stdout
=============================================

## SYNOPSIS

tibet echo [<args>]

## DESCRIPTION

This command can be used as a template for your own custom commands or
to help view how arguments are being parsed.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

    $ tibet echo 'I am a string' --param=foo

    Options:
    {
        "_": ["echo", "I am a string"],
        "color": true,
        "help": false,
        "usage": false,
        "debug": false,
        "stack": false,
        "verbose": false,
        "param": "foo"
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

