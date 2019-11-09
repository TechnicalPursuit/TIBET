{{topic}}({{section}}) -- builds template/css/resource files and config entries
=============================================

## SYNOPSIS

`tibet resource [--build] [--list] [--raw] [--type] [<package-opts>]`

## DESCRIPTION

Reflects on application resource requirements and builds rollup resources.

The `tibet resource` command is used to build JavaScript-based versions of
various resources such as templates, style sheets, JSON data files, etc. The
resulting files can be rolled up into build packages, significantly
reducing the number of HTTP calls necessary to load application resources.

You don't typically need to run this command yourself, the various `build` and
`rollup`-related `tibet make` tasks in your project invoke this command
indirectly and manage most resource-related work for you.

One aspect of this command to be aware of is that the client-side code can only
compute what it believes to be the proper resource paths when no specific paths
are found. These computed paths are checked by the server-side CLI command for
existence and filtered from the final list if the computed filename isn't found.

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

  * `--raw`:
    Don't filter out the raw output from the client list. This will include
references to files which may not exist since no checks are done and some
client-side information is based on computed names from convention.

  * `[package-opts]` :
    Refers to valid options for a TIBET Package object. These include --package,
--config, --phase, --assets, etc. The package@config defaults to
`~app_cfg/main.xml` and its default config (usually @base) so your typical
configuration is built. See help on the `tibet package` command for more
information.

## CONFIGURATION SETTINGS

  * `path`:
    This command reads the entire set of virtual path settings to help it
determine where it should look for existence of files.

  * `package.name`:
    The package name is read to help with determining the name of the default
package file to load.

  * `boot.config`:
    The boot.config is read to determine which package configuration is being
processed.

  * `boot.package`:
    The boot.package is read to determine which package is being processed.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Listing application resource data

By default the `tibet resource` command will list concrete resources it
believes should be processed and will display an example of the `<config/>`
entries it would build:

    $ tibet resource
    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    Filtering 927 potential resources...
    Found 3 concrete resources...
    Configuration Entries (not saved):
    <config id="resources" if="boot.phase_two">
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.xhtml.js"/>
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.css.js"/>
        <script src="~app_build/app_tags.test.less.js"/>
    </config>

### Building application resources

To build resources add the `--build` flag:

    $ tibet resource --build
    # Loading TIBET platform at 2019-11-09T17:43:17.668Z
    # TIBET reflection suite loaded and active in 5219ms
    Filtering 927 potential resources...
    Building 3 concrete resources...
    ~app_tags/APP.hello.app/APP.hello.app.xhtml
    ~app_tags/APP.hello.app/APP.hello.app.css
    ~app_tags/test.less
    Writing package resource entries...
    <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.xhtml.js"/> (added)
    <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.css.js"/> (added)
    <script src="~app_build/app_tags.test.css.js"/> (added)

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
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.xhtml.js"/>
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.app.css.js"/>
    </config>

    <config id="extra-resources">
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.specialsauce.xhtml.js"/>
        <script src="~app_build/app_tags.APP.hello.app.APP.hello.specialsauce.css.js"/>
    </config>

When you use a configuration like the one above TIBET will automatically
recognize that nested entries do not need to be added.

You can then refer to the individual <config/> elements in your other
package configurations to adjust loading as you require.

## TIBET SHELL

This server-side CLI command builds a command line for execution by the
client-side `:resource` command. That command relies on reflection and other
metadata to determine all run-time resources which are appropriate for the
targeted type or build operation.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-package(1)
  * tibet-rollup(1)

