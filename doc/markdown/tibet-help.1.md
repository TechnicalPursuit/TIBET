{{topic}}({{section}}) -- displays help specific to TIBET
=============================================

## SYNOPSIS

tibet help <topic>

## DESCRIPTION

Displays help for a specific command or the 'tibet' command.

You can alternatively get usage data via the `--usage` flag on each command
or complete help output by using the `--help` flag on the target command.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### List help on the `tibet` command itself

    $ tibet

    Usage: tibet <command> <options>

    The tibet command can invoke TIBET built-ins, custom commands,
    tibet makefile.js targets, grunt targets, or gulp targets based
    on your project configuration and your specific customizations.

    <command> built-ins include:

        appcache apropos clone config context deploy doclint
        echo freeze help init lint make package quickstart
        reflect release resources rollup start tag test thaw
        tsh user version

    makefile.js targets include:

        build checkup clean deploy resources rollup

    <options> always include:

        --help         display command help text
        --usage        display command usage summary
        --color        colorize the log output [true]
        --verbose      work with verbose output [false]
        --debug        turn on debugging output [false]
        --stack        display stack with error [false]

    Configure default parameters via 'tibet config'.

    hello@0.1.0 /Users/ss/.nvm/v0.10.36/bin/tibet

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO


