{{topic}}({{section}}) -- creates a new TIBET type
=============================================

## SYNOPSIS

tibet type [--name] [[<root>.]<namespace>:]<typename> [--dir <dirname>] [--dna <template>] [--package <pkgname>] [--config <cfgname>]

## DESCRIPTION

Creates a new TIBET type using the supplied type name and parameters.

Type names can supply one, two or three parts, separated by `.` or `:`.

If three parts are supplied, they are used as the root namespace,
the type namespace and the type name, respectively.

If two parts are supplied, they are used for the type namespace and the type
name and the root namespace is defaulted to either `APP` or `TP`, depending on
whether this command is being executed in an application project or the TIBET
library.

If one part is supplied, and this command is being executed in an application
project, the type namespace is defaulted to the application project name and
the root namespace is defaulted as it is when two parts are supplied. It is not
a valid operation to execute this command with one part when executed inside of
the TIBET library.

## OPTIONS

  * `--dna` :
    The name of the dna (essentially a directory reference) to clone and process
to produce the new type. The default is `default`. Other options are `content`
for `TP.core.Content` subtypes, `controller` for `TP.core.Controller` subtypes,
`compiledtag` for `TP.core.CompiledTag` and `templatedtag` for
`TP.core.TemplatedTag` subtypes. (As you can see the dna name is often simply
the name of a type to use as the supertype, but each does in fact refer to a
unique dna directory.

  * `--config` :
    Used as the name of the config package in the cfg package file that the
new type will be made a part of. If this parameter is not supplied, the default
for a type being created in a project is `scripts` and for a type being created
in the TIBET library is the same as the type namespace name.

  * `--package` :
    Used to determine the cfg package file that will be updated with entries to
load the new type and configure it. If this parameter is not supplied, the
default for a type being created in a project is `~app_cfg/{{appname}}.xml`. For
a type created in the TIBET library it's `lib_cfg/lib_namespaces.xml`.

  * `--dir` :
    Used as the destination directory for the newly created source code files
representing the type. If this parameter is not supplied, the default for a type
being created in a project is `~app_src/tags` and for a type being created in
the TIBET library is `~lib_src/{{type_nsname}}`.

## EXAMPLES

### Create a new type in the default application namespace


    $ tibet type testing

    working in: /Users/ss/temporary/tmp/test/_testing_
    processing files...
    templating complete...
    positioning files...
    positioning complete...
    adjusting package entries...
    <script src="~app_src/APP.test.testing.js"/> (added)
    <script src="~app_src/APP.test.testing_test.js"/> (added)
    New configuration entries created. Review/Rebuild as needed.
    Cleaning up working directory.
    Type DNA 'default' cloned to ~app_src as 'testing'.

In this case we can see TIBET has generated a type as well as an associated
unit test file.

### Create a new custom type in a specific namespace

    $ tibet type APP.special.Type

    working in: /Users/ss/temporary/tmp/test/_Type_
    processing files...
    templating complete...
    positioning files...
    positioning complete...
    adjusting package entries...
    <script src="~app_src/APP.special.Type.js"/> (added)
    <script src="~app_src/APP.special.Type_test.js"/> (added)
    New configuration entries created. Review/Rebuild as needed.
    Cleaning up working directory.
    Type DNA 'default' cloned to ~app_src as 'Type'.

Note that the current `type` command does not define new namespaces so if you
use this approach you should be referring to an existing namespace or you should
be prepared to define the namespace as part of your application startup
sequence.

Also note that TIBET has also updated the package@config so our types load:

    <config id="scripts">
        <!-- put your source scripts here -->
        ...

        <script src="~app_src/APP.special.Type.js"/>
    </config>

...and so do their tests:

    <config id="tests">
        <!-- put your test scripts here -->
        ...

        <script src="~app_src/APP.special.Type_test.js"/>
    </config>

## SEE ALSO

  * tibet-clone(1)
  * tibet-package(1)
