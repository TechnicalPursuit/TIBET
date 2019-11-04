{{topic}}({{section}}) -- resolve and print expanded virtual path value
=============================================

## SYNOPSIS

`tibet path <virtual_path>`

## DESCRIPTION

Produces the fully expanded value for a TIBET virtual path. Note that virtual
paths normally start with a '~' which can cause issues with certain shells so
this command lets you leave the leading '~' off.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

    $ tibet path app_cfg
    ~app_cfg => /Users/ss/dev/TPI/TIBET/TIBET-INF/cfg

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-config(1)
