{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

tibet package [--package <package>] [--config <cfg>] [--profile <profile>]
    [--all] [--missing] [--include <asset names>] [--exclude <asset names>]
    [--unlisted] [--scripts] [--styles] --[images] [--resources] [--templates]
    [--inlined] [--phase <phase>] [--nodes]

## DESCRIPTION

Outputs a list of package assets either as asset nodes or asset paths.

This command is a useful way to view the files which a `tibet rollup` or
`tibet lint` command will process. The best way to get a sense of this
command is to run it with various options, of which there are many:

--package    the file path to the package to process.
--config     the name of an individual config to process.
--profile    a profile in the form of package@config.
--all        process all config tags in the package recursively.
--missing    output a list of missing assets of all types.
--unlisted   output a list of potentially overlooked source files.

--include    a space-separated list of asset tags to include.
--exclude    a space-separated list of asset tags to include.

--nodes      output asset nodes rather than asset paths.
--phase      boot phase subset to process <all | one | two | app | lib>.

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
    ~app_src/tags/APP.sample.app.js

### List resources from a specific package@config pair

    $ tibet package --profile development@developer

    ~app_src/APP.sample.js
    ~app_src/APP.sample.Application.js
    ~app_src/tags/APP.sample.app.js
    ~app_test/APP_test.js
    ~app_src/tags/APP.sample.app_test.js

Here we see that the test files for our application are now listed.

### List resources from a specific package@config pair for APP and LIB

    $ tibet package --profile development@developer --context all

    ~lib_build/tibet_developer.min.js
    ~app_src/APP.sample.js
    ~app_src/APP.sample.Application.js
    ~app_src/tags/APP.sample.app.js
    ~app_test/APP_test.js
    ~app_src/tags/APP.sample.app_test.js

Note that with `--context all` we now see library resources (in this case
`tibet_developer.min.js`) as well as our application's resources.

## SEE ALSO

  * tibet-resources(1)
  * tibet-rollup(1)
