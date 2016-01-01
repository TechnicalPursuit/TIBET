{{topic}}({{section}}) -- outputs current context information to stdout
=============================================

## SYNOPSIS

    tibet context

## DESCRIPTION

Displays information about the current project including values for the library
root, application root, current project name, etc.


## EXAMPLES

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
            "package": "~app_cfg/app.xml",
            "configs": ["base", "contributor", "developer", "full", "test"]
        }
    }
