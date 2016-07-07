{{topic}}({{section}}) -- creates a new TIBET type
=============================================

## SYNOPSIS

tibet type <name> [options]

## DESCRIPTION

Creates a new TIBET tag using the supplied tag name and parameters.

Tag names can supply one, two or three parts, separated by `.` or `:`.

If three parts are supplied, they are used as the root namespace,
the tag type namespace and the tag name, respectively.

If two parts are supplied, they are used for the tag type namespace and the tag
name and the root namespace is defaulted to either `APP` or `TP`, depending on
whether this command is being executed in an application project or the TIBET
library.

If one part is supplied, and this command is being executed in an application
project, the tag type namespace is defaulted to the application project name and
the root namespace is defaulted as it is when two parts are supplied. It is not
a valid operation to execute this command with one part when executed inside of
the TIBET library.

## OPTIONS

  * `--package` :
    Used to determine the cfg package file that will be updated with entries to
load the new tag type and configure it. If this parameter is not supplied, the
default for a tag being created in a project is `~app_cfg/{{appname}}.xml`. For
a tag created in the TIBET library it's `lib_cfg/lib_namespaces.xml`.

  * `--config` :
    Used as the name of the config package in the cfg package file that the
new tag will be made a part of. If this parameter is not supplied, the default
for a tag being created in a project is `scripts` and for a tag being created
in the TIBET library is the same as the tag namespace name.

  * `--dir` :
    Used as the destination directory for the newly created source code files
representing the tag. If this parameter is not supplied, the default for a tag
being created in a project is `~app_src/tags` and for a tag being created in
the TIBET library is `~lib_src/{{tag_nsname}}`.

  * `--compiled` :
    Used to determine whether to create a templated tag or a compiled tag. A
templated tag uses an external template (by default an .xhtml file) to render
itself into an application, whereas a compiled tag overrides the `tagCompile`
and manually manipulates the browser's DOM. The default for this flag is false.

  * `--template` :
    Used to configure the system's `cfg` parameter that points to this tag
type's template. If this parameter is not supplied, this defaults to null as, if
the tag is a templated (i.e. not compiled) one, the system will automatically
associate a similarly-named .xhtml file with the tag's template (this parameter
is not used for compiled tags at all). It will assume that this file is in the
same directory as the tag's source .js file. Supply a value here if the template
file you wish to use for the tag is in a different directory, is of a different
name or is of a different type (i.e. a .svg file). This is highly recommended to
use a virtual URI here (i.e. a URI with a leading `~`).

  * `--style` :
    Used to determine the style sheet configuration for the tag. By default each
tag gets a specific style sheet in the same directory with tag type and optional
template. If you want no style associated you can use the special value
NO\_RESULT. Supply a value here if the tag you are defining has CSS or LESS
style associated with it. This is highly recommended to use a virtual URI here
(i.e. a URI with a leading `~`).

## EXAMPLES

### Create a new templated tag in the default application namespace

    $ tibet tag testing

    New tag: 'APP.hello.testing' added successfully.

    $ ls public/src/tags/test1.testing
    APP.test1.testing.css     APP.test1.testing.xhtml
    APP.test1.testing.js      APP.test1.testing_test.js

In this case we can see TIBET has generated a tag type as well as an associated
template, style sheet, and unit test file.

### Create a new templated tag in a specific namespace

    $ tibet tag APP.special.tag

    New tag: 'APP.special.tag' added successfully

    $ ls public/src/tags/special.tag
    APP.special.tag.css     APP.special.tag.js      APP.special.tag.xhtml
    APP.special.tag_test.js

### Create a new compiled tag

    $ tibet tag logical --compiled

    New tag: 'APP.test1.logical' added successfully.

    $ ls public/src/tags/test1.logical
    APP.test1.logical.css     APP.test1.logical.js      APP.test1.logical_test.js

Note that in this case there's no `.xhtml` template file, just code and style.

Also note that TIBET has also updated the package#config so our tags load:

    <config id="scripts">
        <!-- put your source scripts here -->
        <script src="~app_src/APP.test1.js"/>
        <script src="~app_src/APP.test1.Application.js"/>
        <script src="~app_src/tags/APP.test1.app.js"/>
        <script src="~app_src/tags/test1.testing/APP.test1.testing.js"/>
        <script src="~app_src/tags/special.tag/APP.special.tag.js"/>
        <script src="~app_src/tags/test1.logical/APP.test1.logical.js"/>
    </config>

...and so do their tests:

    <config id="tests">
        <!-- put your test scripts here -->
        <script src="~app_test/APP_test.js"/>
        <script src="~app_src/tags/APP.test1.app_test.js"/>
        <script src="~app_src/tags/test1.testing/APP.test1.testing_test.js"/>
        <script src="~app_src/tags/special.tag/APP.special.tag_test.js"/>
        <script src="~app_src/tags/test1.logical/APP.test1.logical_test.js"/>
    </config>

## SEE ALSO

  * package(1)
