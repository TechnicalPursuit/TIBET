{{topic}}({{section}}) -- manages and displays TIBET configuration data
=============================================

## SYNOPSIS

`tibet config [property[=value]] [--env <env>] [--users]`

## DESCRIPTION

The `config` command can output one or more configuration values to the
console based on current application configuration data. You can also use
this command to set a particular value to a string, number or boolean value.

You can view the entire configuration list by leaving off any specific
value. You can view all values for a particular prefix by listing just
the prefix. You can view a specific value by naming that value directly.

You can dump virtual paths by quoting them as in: `'~app'` or `'~lib'`. Specific
quoting depends on the native shell you may be using. You can alternatively use
the prefix `path` to list all virtual paths or a specific one.

A special `--users` flag lets you view a summary of users from the
application's user data. NOTE that TIBET's file-based user support is only
provided to let you simulate user accounts during development. It is *not
secure* and it should *never be used for production* systems.

Configuration data can be updated by adding an `=` and value to a properly
defined property name.

For updates you can specify an optional environment value using the `--env`
flag. The `env` will default to `development` otherwise. In the current
implementation the concept of an `env` applies only to TDS settings (`tds.\*`
values).

NOTE that if you use this command to set values it will rewrite `tibet.json`
by using the beautify npm module to process the stringified JSON content.
As a result your file may not retain its appearance after updates.

## OPTIONS

  * `property[=value]]` :
    Supplies a property name and optional value to set for that property.

  * `--env` :
    Provides a way to specifically target a particular environment such as
`development` within a configuration file. Note that this option only applies to
values prefixed with `tds.` since environment-specific configuration via JSON is
only done for server configuration values.

## CONFIGURATION SETTINGS

This command manages the entire TIBET configuration system. It can be used to
read and/or update any value with a string, number, or boolean value.

This command not rely on any configuration values for its own operation.

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

There is a client-side TSH command `:config` which mirrors the core
functionality of this command in that it can be used to view or update
configuration settings.

The client-side `:config` command is not invoked by this command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-context(1)
  * tibet-user(1)

