{{topic}}({{section}}) -- echo command line arguments
=============================================

## SYNOPSIS

`tibet echo [<args>]`

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

There is a client-side TSH command `:echo` which mirrors the core
functionality of this command in that it can be used to view how
command line arguments and flags are being parsed.

The client-side `:echo` command is not invoked by this command.


## TROUBLESHOOTING


## SEE ALSO

