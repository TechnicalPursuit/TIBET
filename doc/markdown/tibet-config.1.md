{{topic}}({{section}}) -- manages and displays TIBET configuration data
=============================================

## SYNOPSIS

    tibet config [property[=value]] [--env <env>]

## DESCRIPTION

The config command can output one or more configuration values to the
console based on current configuration data for your application or
update a particular value to a string, number or boolean value.

You can view the entire configuration list by leaving off any specific
value. You can view all values for a particular prefix by listing just
the prefix. You can view a specific value by naming that value directly.

You can dump virtual paths by quoting them as in: `'~app'` or `'~lib'` as needed
by whichever native shell you may be using.

For set operations you can specify an optional environment value. In the
current implementation this applies only to TDS settings (tds.\* values).

NOTE that if you use this command to set values it will rewrite `tibet.json`
by using the beautify npm module to process the stringified JSON content.
As a result your file may not retain its appearance after updates.

Configuration data can also be updated by adding an `=` and value to
a properly defined property name.

## EXAMPLES

### List all configuration values:

    tibet config

### List all path values:

    tibet config '~'

### List all boot.\* values:

    tibet config boot

### List a single value:

    tibet config boot.level

### Set a value (foo.bar to true here):

    tibet config foo.bar=true

