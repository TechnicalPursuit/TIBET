{{topic}}({{section}}) -- resolve and print expanded virtual path value
=============================================

## SYNOPSIS

tibet path <virtual_path>

## DESCRIPTION

Produces the fully expanded value for a TIBET virtual path. Note that virtual
paths normally start with a '~' which can cause issues with certain shells so
this command lets you leave the leading '~' off.

## EXAMPLES

    $ tibet path app_cfg
    ~app_cfg => /Users/ss/dev/TPI/TIBET/TIBET-INF/cfg

## SEE ALSO

  * tibet-config(1)
