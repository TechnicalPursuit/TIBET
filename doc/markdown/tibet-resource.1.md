{{topic}}({{section}}) -- builds template/css/resource files and config entries
=============================================

## SYNOPSIS

tibet resource [--build] [--list] [<package-opts>]

## DESCRIPTION

Reflects on application resource requirements and builds rollup resources.

The `tibet resource` command is used to build JavaScript-based versions of
various resources such as templates, style sheets, JSON data files, etc. The
resulting files can be rolled up into build packages, significantly
reducing the number of HTTP calls necessary to load application resources.

In addition to building loadable versions of resources this command will
maintain the `resources` `<config/>` in your application's package file. By
updating the package this command ensures the `rollup` command will find all
built resources and include them.

## OPTIONS

  * `--build` :
    Tell the command to actually build resources and update the application
package with any missing resource entries.

  * `--list` :
    List but don't build the resources. This is the default flag.

  * `[package-opts]` :
    Refers to valid options for a TIBET Package object. These include --package,
--config, --phase, --assets, etc. The package@config defaults to
`~app_cfg/main.xml` and its default config (usually @base) so your typical
configuration is built. See help on the `tibet package` command for more
information.

## EXAMPLES

### Listing application resource data

By default the `tibet resource` command will list concrete resources it
believes should be processed and will display an example of the `<config/>`
entries it would build:

    $ tibet resource
    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 09:45:14 MDT
    TIBET loaded in 3064 ms. Starting execution.
    Filtering 927 potential resources...
    Found 3 concrete resources...
    Configuration Entries (not saved):
    <config id="resources" if="boot.phase_two">
        <script src="~app_build/tags.APP.hello.app.xhtml.js"/>
        <script src="~app_build/tags.APP.hello.app.css.js"/>
        <script src="~app_build/tags.test.less.js"/>
    </config>

### Building application resources

To build resources add the `--build` flag:

    $ tibet resource --build
    Loading TIBET via PhantomJS 2.1.1 at June 30, 2016 at 09:43:01 MDT
    TIBET loaded in 3680 ms. Starting execution.
    Filtering 927 potential resources...
    Building 3 concrete resources...
    ~app_src/tags/APP.hello.app.xhtml
    ~app_src/tags/APP.hello.app.css
    ~app_src/tags/test.less
    Writing package resource entries...
    <script src="~app_build/tags.APP.hello.app.xhtml.js"/> (added)
    <script src="~app_build/tags.APP.hello.app.css.js"/> (added)
    <script src="~app_build/tags.test.css.js"/> (added)

Note that if you build multiple times the `(added)` qualifier will show
`(exists)` for any resources the package already contains.

### Modularizing application resources

For larger applications or applications which need to load resources in
different bundles you can use nested `<config/>` elements. To accomplish
this run the `tibet resource` command once to load the initial set of
resources, then partition them into separate `<config/>` elements:

    <config id="resources" if="boot.phase_two boot.resourced">
        <config ref="startup-resources"/>
        <config ref="extra-resources"/>
    </config>

    <config id="startup-resources">
        <script src="~app_build/tags.APP.hello.app.xhtml.js"/>
        <script src="~app_build/tags.APP.hello.app.css.js"/>
    </config>

    <config id="extra-resources">
        <script src="~app_build/tags.APP.hello.specialsauce.xhtml.js"/>
        <script src="~app_build/tags.APP.hello.specialsauce.css.js"/>
    </config>

When you use a configuration like the one above TIBET will automatically
recognize that nested entries do not need to be added.

You can then refer to the individual <config/> elements in your other
package configurations to adjust loading as you require.

## SEE ALSO

  * tibet-package(1)
  * tibet-rollup(1)

