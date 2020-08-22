{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

`tibet package [[--profile <pkgcfg>] | [--package <package>]
    [--config <cfg>]] [--phase=['all'|'one'|'two'|'app'|'lib']]
    [--add <file_list>] [--remove <file_list>]
    [--all] [--unresolved] [--unlisted] [--inlined]
    [--include <asset names>] [--exclude <asset names>]
    [--scripts] [--resources] [--images]
    [--silent] [--fix] [--verbose] [--stack]`

## DESCRIPTION

Outputs a list of package assets either as asset nodes or asset paths.

This command is a useful way to view the files TIBET will load or process
via commands such as `tibet rollup` or `tibet lint`. The best way to get a sense
of this command is to run it with various options, of which there are many.

You generally don't need to run this command yourself, most operations around
packaging, rollups, minification, etc. are managed by the various `tibet make`
targets which support `build` operations in various forms. See the files in your
project's `~app_cmd/make` directory for specifics.

The underlying machinery of the `package` command is shared by a number of other
TIBET commands, all of which leverage TIBET's application package/config files.
This includes the `rollup`, `resources`, and `lint` commands as well as any
command line which launches TIBET headlessly to leverage reflection.

Note that this command can also take a set of open-ended options that correspond
to config 'boot.' properties. So, for instance, '--boot.minified=false' can be
supplied on the command line and this will set the appropriate boot property.

## OPTIONS

  * `--profile`:
    A profile in the form of package@config.

  * `--package`:
    The file path to the package to process.

  * `--config`:
    The name of an individual config to process.

  * `--phase`:
    Boot phase subset to process <all | one | two | app | lib>.

  * `--add`:
    List of resources to add to the package.

  * `--remove`:
    List of resources to remove from the package.

  * `--all`:
    Process all the config tags in the package.

  * `--unresolved`:
    Output a list of unresolved (not found) assets of all types.

  * `--unlisted`:
    Output a list of potentially overlooked source files.

  * `--inlined`:
    Include boot.resourced resources (inlined URI content)

  * `--include`:
    A space-separated list of asset tags to include.

  * `--exclude`:
    A space-separated list of asset tags to include.

  * `--images`:
    Include all image assets.

  * `--resources`:
    Include all style, template, and resource assets.

  * `--scripts`:
    Include all JavaScript source-containing assets.

  * `--silent`:
    Suppress all logging of 'duplicate assets' for quieter operation.

  * `--fix`:
    Whether or not to add asset files that are found on disk but not as package
entries (and need to be inserted) or package entries for which asset files can
no longer be found (and need to be deleted).

  * `--verbose`:
    Whether or not to log unlisted asset files that are found on disk but not as
package entries.

  * `--stack` :
    Tells the packaging machinery to print an output of the stack if it errors.

## CONFIGURATION SETTINGS

  * `boot.package`:
    Read if there is no profile or other package info provided.

  * `tds.pouch.prefix`:
    Read to determine what directory (if any) should be ignored so we avoid
trying to package anything from PouchDB.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### List known resources from the current application package

    $ tibet package

    ~app_src/APP.sample.js
    ~app_src/APP.sample.Application.js
    ~app_tags/APP.sample.app/APP.sample.app.js

### List resources from a specific package@config pair

    $ tibet package --profile development@developer

    ~app_src/APP.sample.js
    ~app_src/APP.sample.Application.js
    ~app_tags/APP.sample.app/APP.sample.app.js
    ~app_test/APP_test.js
    ~app_tags/APP.sample.app/APP.sample.app_test.js

Here we see that the test files for our application are now listed.

### List resources from a specific package@config pair for APP and LIB

    $ tibet package --profile development@developer --context all

    ~lib_build/tibet_developer.min.js
    ~app_src/APP.sample.js
    ~app_src/APP.sample.Application.js
    ~app_tags/APP.sample.app/APP.sample.app.js
    ~app_test/APP_test.js
    ~app_tags/APP.sample.app/APP.sample.app_test.js

Note that with `--context all` we now see library resources (in this case
`tibet_developer.min.js`) as well as our application's resources.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-resources(1)
  * tibet-rollup(1)
