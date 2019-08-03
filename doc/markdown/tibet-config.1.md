{{topic}}({{section}}) -- manages and displays TIBET configuration data
=============================================

## SYNOPSIS

tibet config [property[=value]] [--env <env>]

## DESCRIPTION

The `config` command can output one or more configuration values to the
console based on current configuration data for your application or
update a particular value to a string, number or boolean value.

You can view the entire configuration list by leaving off any specific
value. You can view all values for a particular prefix by listing just
the prefix. You can view a specific value by naming that value directly.

You can dump virtual paths by quoting them as in: `'~app'` or `'~lib'` as needed
by whichever native shell you may be using.

For set operations you can specify an optional environment value. In the
current implementation this applies only to TDS settings (`tds.\*` values).

NOTE that if you use this command to set values it will rewrite `tibet.json`
by using the beautify npm module to process the stringified JSON content.
As a result your file may not retain its appearance after updates.

Configuration data can also be updated by adding an `=` and value to
a properly defined property name.

## OPTIONS

  * `property[=value]]` :
    Supplies a property name and optional value to set for that property.

  * `--env` :
    Provides a way to specifically target a particular environment such as
`development` within a configuration file. Note that this option only applies to
values prefixed with `tds.` since environment-specific configuration via JSON is
only done for server configuration values.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### List a single value:

    $ tibet config boot.level

    INFO

### Set a value (foo.bar to true here):

    $ tibet config foo.bar=true

    true

### List all configuration values:

    $ tibet config

    {
        "~": "/Users/ss/temporary/todomvc",
        "~app": "~/public",
        ...
        ...
    }

### List all path `~*` values:

    $ tibet config path

    {
        "~": "/Users/ss/temporary/todomvc",
        "~app": "~/public",
        "~lib": "/Users/ss/temporary/todomvc/node_modules/tibet",
        "path.app": "~app_root",
        "path.app_bin": "~app/bin",
        "path.app_boot": "~app_inf/boot",
        "path.app_build": "~app/build",
        ...
        ...
    }

### List all `boot.*` values:

    $ tibet config boot

    {
        "boot.console_log": false,
        "boot.context": "nodejs",
        "boot.defer": true,
        "boot.delta_threshold": 50,
        "boot.error_max": 20,
        "boot.fatalistic": false,
        ...
        ...
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-context(1)
