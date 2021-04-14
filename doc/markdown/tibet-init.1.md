{{topic}}({{section}}) -- initialize TIBET library or project
=============================================

## SYNOPSIS

`tibet init [--force] [--freeze] [--tibet]`

## DESCRIPTION

Initializes a TIBET project or installation, linking and installing
dependencies.

Upon initial library installation via `npm` the `tibet init` command should be
run to ensure the new TIBET installation is properly configured.

In a project context this command must be run prior to most activity. Many of
the TIBET cli commands will fail to run until you have run a `tibet init`
command.

The optional `--freeze` is effectively like running `tibet freeze` during
initialization. This parameter will cause TIBET to make a copy of
the current globally installed version in the project and update the
package.json to refer to that version. Normally the current running release is
simply linked into position via `npm link tibet`.

## OPTIONS

  * `--force` :
    Causes any existing initialization or links to be replaced rather than
exiting the command.

  * `--freeze` :
    Used to lock your project to a specific version of TIBET within the
package.json and node_modules locations.

  * `--tibet` :
    Used to specify that the focus of the command should be the TIBET library
rather than any currently-enclosing project.

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

### Install TIBET and initialize it

    $ npm install -g tibet

    $ tibet init

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
