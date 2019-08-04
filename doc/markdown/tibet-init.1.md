{{topic}}({{section}}) -- initialize a TIBET project
=============================================

## SYNOPSIS

tibet init [--freeze]

## DESCRIPTION

Initializes a TIBET project, linking and installing dependencies.

This command must be run prior to most activity within a TIBET
project. Many of the TIBET cli commands will fail to run until
you have run a `tibet init` command.

The optional `--freeze` is effectively like running `tibet freeze` during
initialization. This parameter will cause TIBET to make a copy of
the current globally installed version in the project and update the
package.json to refer to that version. Normally the current running release is
simply linked into position via `npm link tibet`.

## OPTIONS

  * `--freeze` :
    Used to lock your project to a specific version of TIBET within the
package.json and node_modules locations.

## CONFIGURATION SETTINGS

  * `npm.name` :
    The project name, used only when cloning to an existing directory with an
existing `package.json` file that can supply this value.

  * `tibet.dna` :
    Read to determine the default project DNA to clone for this new project. If
this value doesn't exist then `default` is the name used.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Initialize a fresh project

    $ tibet init

    Initializing new default project...
    installing project dependencies via `npm install`.
    linking TIBET into project via `npm link tibet`.
    TIBET development dependency linked.
    Project initialized successfully.

### Initialize a fresh project and lock TIBET to the current version.

    $ tibet init --freeze
    Initializing new default project...
    installing dependencies via `npm install`, be patient.
    installing TIBET version v5.0.0-pre.1 via `cp -R`.
    Project initialized successfully.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-clone(1)
