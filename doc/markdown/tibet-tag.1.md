{{topic}}({{section}}) -- creates a new TIBET tag
=============================================

## SYNOPSIS

`tibet tag [[--name] [<root>.][<namespace>(.|:)]]<tagname>
    [--action | --compiled | --info | --templated]
    [--supertype <typename] [--dir <dirname>] [--dna <template>]
    [--xmlns <nsuri>] [--package <package>] [--config <cfg>]`

## DESCRIPTION

Creates a new TIBET tag using the supplied tag name and parameters.

Tag names can supply one, two or three parts, separated by `.` or `:`.

If three parts are supplied, they are used as the root namespace,
the tag namespace and the tag name, respectively.

If two parts are supplied, they are used for the tag namespace and the tag
name and the root namespace is defaulted to either `APP` or `TP`, depending on
whether this command is being executed in an application project or the TIBET
library.

If one part is supplied, and this command is being executed in an application
project, the tag namespace is defaulted to the application project name and
the root namespace is defaulted as it is when two parts are supplied. It is not
a valid operation to execute this command with one part when executed inside of
the TIBET library.

Depending on the DNA chosen the result will be creation of the tag and
optionally a template, style sheet, and test file.

## OPTIONS

  * `--name` :
    An alternate way to provide the tag name to create.

  * `--xmlns` :
    Lets you define a specific XMLNS URI for any XHTML and CSS references. The
default will be `urn:app:{{appname}}` or the standard TIBET prefix URI.

  * `--supertype` :
    The name of the supertype to use for the target tag. This should be
specified as a fully-qualified {root}.{namespace}.{typename} triplet.

  * `--action`:
    Specify that the new tag should be an action tag and use the appropriate dna
and supertype for a `TP.tag.ActionTag` subtype.

  * `--compiled`:
    Specify that the new tag should be a compiled tag and use the appropriate
dna and supertype for a `TP.tag.CompiledTag` subtype.

  * `--info`:
    Specify that the new tag should be an info tag and use the appropriate
dna and supertype for a `TP.tag.InfoTag` subtype.

  * `--templated`:
    Specify that the new tag should be a templated tag and use the appropriate
dna and supertype for a `TP.tag.TemplatedTag` subtype. This is the default.

  * `--dna` :
    The name of the dna (essentially a directory reference) to clone and process
to produce the new type. The default is `templatedtag`. Other tag-specific
options are `actiontag`, `computedtag` and `infotag`. (As you can see the dna
name is often simply the lowercased name of a type to use as the supertype, but
each does in fact refer to a unique dna directory.

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
being created in a project is `~app_tags` and for a type being created in
the TIBET library is `~lib_src/{{type_nsname}}`.

## CONFIGURATION SETTINGS

  * `tibet.project.name`:
    The 'appname' as represented by the name of the project.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Create a new tag in the default application namespace


    $ tibet tag header

    working in: /Users/ss/temporary/hello/_header_
    processing directories...
    processing templates...
    templating complete...
    positioning files...
    positioning complete...
    adjusting package entries...
    <package src="~app_tags/APP.hello.header/"/> (added)
    New configuration entries created. Review/Rebuild as needed.
    Cleaning up working directory.
    Type DNA 'templatedtag' cloned to ~app_tags/APP.hello.header as 'header'.


Note that the `tag` command does not define new namespaces so if you use this
approach you should be referring to an existing namespace or you should be
prepared to define the namespace as part of your application startup sequence.

Also note that TIBET has also updated the package@config so our tag loads:

    <config id="scripts">
        <!-- put your source scripts here -->
        ...

        <script src="~app_src/APP.hello.Header.js"/>
    </config>

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-clone(1)
  * tibet-package(1)
  * tibet-type(1)
