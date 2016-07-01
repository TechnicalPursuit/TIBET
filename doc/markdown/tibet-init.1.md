{{topic}}({{section}}) -- initialize a TIBET project
=============================================

## SYNOPSIS

tibet init [--link]

## DESCRIPTION

Initializes a TIBET project, linking and installing dependencies.

This command must be run prior to most activity within a TIBET
project. Many of the TIBET cli commands will fail to run until
you have run a `tibet init` command.

The optional `--link` parameter will use `npm link tibet` to link
TIBET into the project rather than attempting to install it via
the current npm package.

## OPTIONS

  * `--link` :
    Necessary when you are working with a copy of TIBET cloned from the
public repository. For `--link` to work properly you need to have a local TIBET
repository and you need to have run `npm link .` in that repository prior to
tibet init.

## EXAMPLES

### Initialize a fresh project

    $ tibet init

    Initializing new default project...
    installing project dependencies via `npm install`.
    TIBET development dependency linked.
    Project initialized successfully.

### Initialize a fresh project by linking a local TIBET install

    $ tibet init --link

    Initializing new default project...
    linking TIBET into project via `npm link tibet`.
    installing dependencies via `npm install`, be patient.
    TIBET development dependency linked.
    Project initialized successfully.

## SEE ALSO

  * clone(1)
