{{topic}}({{section}}) -- outputs current context information
=============================================

## SYNOPSIS

`tibet context`

## DESCRIPTION

Displays core contextual information about the current project including values
for the library root, application root, current project name, current boot
profile, package, config, and package configuration options.

The data provided is often helpful in showing you where the key paths for
project launch point and what the baseline boot profile elements are.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

  * `npm.name` :
    The project name.

  * `npm.version` :
    The project version.

  * `boot.config` :
    If no `boot.package` is found `boot.config` is read to try to determine the
package configuration that is set to boot by default.

  * `boot.package` :
    If no `boot.profile` is found `boot.package` is read to get the package
name that is set to boot by default.

  * `boot.profile` :
    Read to determine if a `package@config` has been set for booting.


## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### In a TIBET project

    $ tibet context

    {
        "name": "hello",
        "version": "0.1.0",
        "in_library": false,
        "in_project": true,
        "~": "/Users/ss/temporary/hello",
        "~app": "~/public",
        "~lib": "/Users/ss/temporary/hello/node_modules/tibet",
        "boot": {
            "profile": null,
            "package": "~app_cfg/main.xml",
            "configs": ["base", "baseui", "contributor", "developer", "full", "production"],
            "config": "production"
        }
    }

### In the TIBET library

    $ tibet context

    {
        "name": "tibet",
        "version": "5.0.0-pre.51",
        "in_library": true,
        "in_project": false,
        "~": "/Users/ss/dev/TPI/TIBET",
        "~app": "/Users/ss/dev/TPI/TIBET",
        "~lib": "/Users/ss/dev/TPI/TIBET",
        "boot": {
            "profile": null,
            "package": "~lib_cfg/TIBET.xml",
            "configs": ["base", "base-inlined", "baseui", "baseui-inlined", "contributor", "developer", "full", "hook", "inlined", "kernel", "loader", "login", "lama-inlined", "small", "standard", "test-inlined", "testing", "worker", "xctrls-inlined"],
            "config": "base"
        }
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-config(1)

