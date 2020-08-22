{{topic}}({{section}}) -- clones a project from a template directory
=============================================

## SYNOPSIS

`tibet clone <target>|[--name <appname>] [--dir <dirname>] [--dna <template>]
    [--list] [--force] [--update]`

## DESCRIPTION

Clones a template directory, considered the `dna`, to create a new project.

`<target>` or `--name` is required and should be a valid name for use within a
JavaScript context. The application name becomes part of automatically generated
types in the TIBET system.

By default the target `--dir` will be the new project's appname unless otherwise
specified via `--dir`. You can use `.` to clone to the current directory HOWEVER
*no checks are currently done to prevent potential data loss*. Be careful!

NOTE: a future update to this command should provide interactive use that
will allow you to manage the clone process in a more incremental fashion.

Once a project template has been cloned you use the `tibet init` command to
initialize the project by triggering installation of all project dependencies.

## OPTIONS

  * `--dir` :
    Specify a particular target directory. Defaults to the value of the `--name`
parameter so `tibet clone hello` will presume `--dir=./hello` for example. The
value `.` can be used to target the current directory without creating a new
subdirectory.

  * `--dna` :
    Lets you clone any valid template in TIBET's `dna` directory or a
directory of your choosing. This latter option lets you create your own reusable
custom application templates.

  * `--force` :
    Required if you use `.` as a simple reminder to be careful. You can also
use `--force` with existing directories but *no checks are done* to avoid
overwriting existing files.

  * `--list` :
    Output a list of available dna options. No project is created if you use
this option.

  * `--name` :
    Lets you rename from the directory name to an alternative name. This lets
the directory and appname vary. This is common when cloning to existing
directories or poorly named ones like those required for GitHub Pages
repositories.

  * `--update` :
    Attempts to update the existing project from the files found in the source
dna. This option tries to avoid overwriting existing files but should be *used
with extreme caution*.

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

### See the list of available project dna

    $ tibet clone --list

    couch
    default
    electron
    ghpages

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

