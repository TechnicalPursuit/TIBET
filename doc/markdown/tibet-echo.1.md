{{topic}}({{section}}) -- echo command line arguments to stdout
=============================================

## SYNOPSIS

    tibet echo [<args>]

## DESCRIPTION

This command can be used as a template for your own custom commands or
to help view how arguments are being parsed.

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
