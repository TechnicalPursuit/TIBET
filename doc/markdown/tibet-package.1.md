{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

tibet package [ [--profile] <pkg_cfg> | [--package <package>] [--config <cfg>] ]
    [--phase <phase>] [--all] [--scripts] [--styles] [--images] [--resources]
    [--templates] [--inlined] [--nodes]
    [--include <asset names>] [--exclude <asset names>]
    [--add <list>] [--remove <list>] [--unresolved] [--unlisted] [--fix]

## DESCRIPTION

Outputs a list of package assets either as asset nodes or asset paths.

This command is a useful way to view the files TIBET will load or process
via commands such as `tibet rollup` or `tibet lint`. The best way to get a sense
of this command is to run it with various options, of which there are many:

--profile    a profile in the form of package@config.
--package    the file path to the package to process.
--config     the name of an individual config to process.
--phase      boot phase subset to process <all | one | two | app | lib>.
--all        process all the config tags in the package.

--add        list of resources to add to the package.
--remove     list of resources to remove from the package.
--unresolved output a list of unresolved (not found) assets of all types.
--unlisted   output a list of potentially overlooked source files.
--fix        update the package with unresolved/unlisted data.

--include    a space-separated list of asset tags to include.
--exclude    a space-separated list of asset tags to include.

--nodes      output asset nodes rather than asset paths.

--images     include all image assets.
--templates  include all template assets.
--resources  include all style, template, and resource assets.
--scripts    include all JavaScript source-containing assets.
--styles     include all CSS containing assets.

--inlined    include boot.resourced resources (inlined URI content)

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

## SEE ALSO

  * tibet-resources(1)
  * tibet-rollup(1)
