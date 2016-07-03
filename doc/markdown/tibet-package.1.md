{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

tibet package [--package <package>] [--config <cfg>] [--profile <profile>]
    [--all] [--missing] [--include <asset names>] [--exclude <asset names>]
    [--scripts] [--styles] --[images] [--resources] [--templates]
    [--inlined] [--phase <phase>] [--nodes]

## DESCRIPTION

Outputs a list of package assets either as asset nodes or asset paths.

This command is a useful way to view the files which a `tibet rollup` or
`tibet lint` command will process. The best way to get a sense of this
command is to run it with various options, of which there are many:

--package    the file path to the package to process.
--config     the name of an individual config to process.
--profile    a profile in the form of package#config.
--all        process all config tags in the package recursively.
--missing    output a list of missing assets of all types.

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

    ~lib_build/tibet_base.min.js
    ~app_src/APP.todomvc.js
    ~app_src/APP.todomvc.Application.js
    ~app_src/tags/APP.todomvc.app.js
    ~app_src/tags/test.less
    ~app_build/tags.APP.todomvc.app.xhtml.js
    ~app_build/tags.APP.todomvc.app.css.js
    ~app_build/tags.test.css.js

### List resources from a specific package#config pair

    $ tibet package --profile development#developer

    ~lib_build/tibet_developer.min.js
    ~app_src/APP.test1.js
    ~app_src/APP.test1.Application.js
    ~app_src/tags/APP.test1.app.js
    ~app_src/tags/test1.testing/APP.test1.testing.js
    ~app_src/tags/special.tag/APP.special.tag.js
    ~app_src/tags/test1.logical/APP.test1.logical.js
    ~app/test/APP_test.js
    ~app_src/tags/APP.test1.app_test.js
    ~app_src/tags/test1.testing/APP.test1.testing_test.js
    ~app_src/tags/special.tag/APP.special.tag_test.js
    ~app_src/tags/test1.logical/APP.test1.logical_test.js

Note that in the output above we see that TIBET will load the developer source
package as well as all the application test files.

### List resources from the current application package as nodes

    $ tibet package --nodes

    <script src="~lib_build/tibet_base.min.js" if="boot.minified" unless="boot.teamtibet" load_package="~app_cfg/tibet.xml" load_config="base"/>
    <script src="~app_src/APP.todomvc.js" load_package="~app_cfg/todomvc.xml" load_config="scripts"/>
    <script src="~app_src/APP.todomvc.Application.js" load_package="~app_cfg/todomvc.xml" load_config="scripts"/>
    <script src="~app_src/tags/APP.todomvc.app.js" load_package="~app_cfg/todomvc.xml" load_config="scripts"/>
    <resource href="~app_src/tags/test.less" load_package="~app_cfg/todomvc.xml" load_config="scripts"/>
    <script src="~app_build/tags.APP.todomvc.app.xhtml.js" load_package="~app_cfg/todomvc.xml" load_config="resources"/>
    <script src="~app_build/tags.APP.todomvc.app.css.js" load_package="~app_cfg/todomvc.xml" load_config="resources"/>
    <script src="~app_build/tags.test.css.js" load_package="~app_cfg/todomvc.xml" load_config="resources"/>


## SEE ALSO

  * resources(1)
  * rollup(1)
