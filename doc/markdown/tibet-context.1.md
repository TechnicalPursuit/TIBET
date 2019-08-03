{{topic}}({{section}}) -- outputs current context information to stdout
=============================================

## SYNOPSIS

tibet context

## DESCRIPTION

Displays core contextual information about the current project including values
for the library root, application root, current project name, etc. The data
provided is often helpful in showing you where the key paths for project launch
point and what the baseline boot profile elements are.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### In a TIBET project

    $ tibet context

    {
        "name": "d2d",
        "version": "0.1.0",
        "in_library": false,
        "in_project": true,
        "~": "~/tmp/d2d",
        "~app": "~/public",
        "~lib": "~app/TIBET-INF/tibet",
        "boot": {
            "package": "~app_cfg/main.xml",
            "configs": ["base", "contributor", "developer", "full", "test"]
        }
    }

### In the TIBET library

    $ tibet context

    {
        "name": "tibet",
        "version": "v5.0.0-dev.7",
        "in_library": true,
        "in_project": false,
        "~": "~/dev/TPI/TIBET",
        "~app": "~/dev/TPI/TIBET",
        "~lib": "~/dev/TPI/TIBET",
        "boot": {
            "package": "~lib_cfg/TIBET.xml",
            "configs": ["base", "developer", "full", "test"]
        }
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-config(2)
