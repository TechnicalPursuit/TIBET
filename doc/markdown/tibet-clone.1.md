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
