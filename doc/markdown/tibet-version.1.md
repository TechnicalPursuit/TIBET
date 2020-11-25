{{topic}}({{section}}) -- display and update version information
=============================================

## SYNOPSIS

`tibet version [<version>] [--context] [--check] [--full] [version_options]`

## DESCRIPTION

Displays and optionally updates the current version string for a project (or the
TIBET library itself). Also available as the --version flag on the 'tibet'
command (tibet --version).

The --context flag can be set to 'app', 'lib', or 'all' so you can use this
command to see both your project version and the current version of TIBET.

Use --check to request this command to check with the npm repository to see
whether a newer version of the project project been published.

Use the --full flag to output the fully-qualified version string which includes
git information such as the parent commit, commit count, and timestamp.

Several flags (version\_options) can be used to define the new version string
value. The --major, --minor, and --patch flags are booleans which will update
those portions of the version string respectively (and 0 out any descendant
values). The --suffix and --increment flags can be used to define a version
suffix such as 'dev' or 'rc' and an accompanying increment value (like a build
counter). The --version flag can be used to set an explicit value string.
Finally --sync will cause this command to update the git metadata portion of the
version string. This latter option is very useful to ensure TIBET's boot caches
are updated properly.

## OPTIONS

  * `--context` :
    Set the context (app, lib, or all) the command should run on. NOTE that
'all' is invalid except for the display aspect of this command. Version updates
are always done based on whether you are running in a project or inside the lib.

  * `--check` :
    Check the current project (or TIBET version) against the latest released
version. This operation relies on `npm info {name} --json` to return data about
publicly available project or library releases.

  * `--full` :
    Display the fully-qualified version string (including git metadata).

  * `--major` :
    Update the major version number and zero out the minor and patch values.

  * `--minor` :
    Update the minor version number, leave major, and zero out patch value.

  * `--patch` :
    Update the patch version number, leaving major and minor untouched.

  * `--suffix` :
    Add a version suffix (beta, dev, rc, final, hotfix, pre) to the version.

  * `--increment` :
    Set a suffix increment, essentially a form of "build count" value to the
version string.

  * `--version` :
    Set an explicit version string value. Must include a major.minor.patch
value.

  * `--sync` :
    Preserve current major.minor.patch-suffix.increment values but update the
git metadata based on running git describe.

## CONFIGURATION SETTINGS

  * `npm.name` :
    The project name.

  * `npm.version` :
    The project version.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Display the current application version data

    $ tibet version
    hello@0.1.0

### Display the current full application version string

    $ tibet version --full
    hello@0.1.0+g04e020369c.0.1606254066371

### Check on whether there's a newer release of TIBET available

    $ tibet version --check --context=lib
    tibet@5.1.0 (latest)

### Update the version metadata using latest git information

    $ tibet version --sync
    Set version 0.1.0+g04e020369c.0.1606257260601? Type 'yes' to continue:


## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-context(1)
  * tibet-release(1)
