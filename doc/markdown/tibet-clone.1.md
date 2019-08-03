{{topic}}({{section}}) -- clones a project from a template directory
=============================================

## SYNOPSIS

tibet clone <target> [--list] [--force] [--name <appname>] [--dna <template>]

## DESCRIPTION

Clones a template directory, considered the `dna`, to create a new project.

`<target>` is required and must be a valid directory name to clone to.

By default the target will be the new project's appname unless otherwise
specified. You can use `.` to clone to the current directory HOWEVER no checks
are currently done to prevent potential data loss. Be careful!

NOTE this command is currently being re-evaluated and will likely become a
front-end for Yeoman functionality in a future release.

Once a project template has been cloned you use the `tibet init` command to
initialize the project by triggering installation of all project dependencies.

## OPTIONS

  * `--list` :
    Output a list of available dna options. No project is created if you use
this option.

  * `--force` :
    Required if you use `.` as a simple reminder to be careful. You can also
use `--force` with existing directories but *no checks are done* to avoid
overwriting existing files.

  * `--name` :
    Lets you rename from the directory name to an alternative name. This lets
the directory and appname vary. This is common when cloning to existing
directories or poorly named ones like those required for GitHub Pages
repositories.

  * `--dna` :
    Lets you clone any valid template in TIBET's `dna` directory or a
directory of your choosing. This latter option lets you create your own reusable
custom application templates.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### See the list of available project dna

    $ tibet clone --list

    couch
    default
    electron
    ghpages
    noserver

### Create a new project with `default` dna

    $ tibet clone helloworld

    TIBET dna 'default' cloned to helloworld as app 'helloworld'.

### Create a new project with `couch` dna

    $ tibet clone hellocouch --dna couch

    TIBET dna 'couch' cloned to hellocouch as app 'hellocouch'.

### Create a new project in an existing directory

    $ tibet clone .

    TIBET dna 'default' cloned to . as app 'hellolocal'

### Create a named project in an existing directory (empty)

    $ tibet clone --name hello .

    TIBET dna 'default' cloned to . as app 'hello'.

### Create a named project in an existing directory (not empty)

NOTE NOTE NOTE!!! This command can overlay files and is potentially
destructive!!! Future versions of the `clone` command may use `yeoman` to help
avoid file conflicts, allowing this operation to be done safely.

    $ tibet clone --name hello . --force

    TIBET dna 'default' cloned to . as app 'hello'.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-init(1)

