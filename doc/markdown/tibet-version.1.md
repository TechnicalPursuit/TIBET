{{topic}}({{section}}) -- displays the current project and TIBET version
=============================================

## SYNOPSIS

`tibet version [--check]`

## DESCRIPTION

Displays the current version of TIBET. Also available as the
--version flag on the 'tibet' command (tibet --version).

Use --check to request this command to check whether a newer
version of TIBET has been published.

## OPTIONS

  * `--check` :
    Tell TIBET to check the current project TIBET version against the latest
released version. This operation relies on `npm info tibet --json` to return
data about publicly available TIBET releases.

## CONFIGURATION SETTINGS

  * `npm.name` :
    The project name.

  * `npm.version` :
    The project version.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Display the current application and TIBET version data

    $ tibet version

    hello 0.1.0 running on TIBET v5.0.0-dev.7

### Check on whether there's a newer release of TIBET available

    $ tibet version --check

    Your current version 5.0.0-pre.51 is the latest.

If a new version is available you'll see something similar to:

    Version v5.0.0-dev.11 is available. You have v5.0.0-dev.7

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-config(1)
