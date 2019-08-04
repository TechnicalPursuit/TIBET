{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

tibet package [ [--profile] <pkg_cfg> | [--package <package>] [--config <cfg>] ]
    [--phase <phase>] [--all] [--scripts] [--styles] [--images] [--resources]
    [--templates] [--inlined] [--nodes]
    [--include <asset names>] [--exclude <asset names>]
    [--add <list>] [--remove <list>] [--unresolved] [--unlisted]

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

## OPTIONS

  * `profile`:
    A profile in the form of package@config.

  * `package`:
    The file path to the package to process.

  * `config`:
    The name of an individual config to process.

  * `phase`:
    Boot phase subset to process <all | one | two | app | lib>.

  * `all`:
    Process all the config tags in the package.

  * `add`:
    List of resources to add to the package.

  * `remove`:
    List of resources to remove from the package.

  * `unresolved`:
    Output a list of unresolved (not found) assets of all types.

  * `unlisted`:
    Output a list of potentially overlooked source files.

  * `include`:
    A space-separated list of asset tags to include.

  * `exclude`:
    A space-separated list of asset tags to include.

  * `nodes`:
    Output asset nodes rather than asset paths.

  * `images`:
    Include all image assets.

  * `templates`:
    Include all template assets.

  * `resources`:
    Include all style, template, and resource assets.

  * `scripts`:
    Include all JavaScript source-containing assets.

  * `styles`:
    Include all CSS containing assets.

  * `inlined`:
    Include boot.resourced resources (inlined URI content)

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
