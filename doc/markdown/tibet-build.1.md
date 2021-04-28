{{topic}}({{section}}) -- build the current project
=============================================

## SYNOPSIS

`tibet build [--release] [--minify] [--zip] [--brotli] [--clean]`

## DESCRIPTION

Performs the steps necessary to build the current project.

The `build` command is a `tibet make` target you can use as-is or customize to
meet the specific needs of your project. The implementation of `build` can be
found in `~app_cmd/make/build.js`.

The default implementation runs a sequence of `tibet make` targets to:

Lint the project
Verify package integrity
Build any inline resources
Roll up (concat) the package
Build project documentation

These individual steps are also found in the `~app_cmd/make` directory. Most
build steps eventually make use of the `package` and `rollup` commands.

A default set of flags lets you control whether you want the build to be
release-ready, minified, zipped, or brotli'd.


## OPTIONS

  * `--brotli` :
    Request a brotli-compressed version of the final build resources.

  * `--clean` :
    Force the build to work from a clean starting point rather than building
out just the changed resources.

  * `--minify` :
    Request minified versions of each file be built. By default `build` creates
packages which allow TIBET's reflection-driven tools to read source code
comments etc. This flag will strip that content, minify arguments, etc.

  * `--release` :
    Build out all the necessary inline resources etc. for a release package.

  * `--zip` :
    Build a zipped version of the final build assets. During development the
build assets are concatenated but no new zip (or brotli) versions are built.

## CONFIGURATION SETTINGS

  * `make.compression.parse_options` :
    A set of default command argument values controlling file compression.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Run a typical build

    $ tibet build
    Delegating to 'tibet make build'
    building app...
    checking for lint...

    checked 19 of 507 total files
    (59 filtered, 429 unchanged)
    0 errors, 0 warnings. Clean!
    verifying packages...
    verifying ~app_cfg/main.xml@base
    scanning for unresolved/unlisted files...
    no unresolved files found in project.
    processing resources...
    generating resources...
    # Loading TIBET platform at 2021-04-28T19:42:34.130Z
    # TIBET reflection suite loaded and active in 12863ms
    filtering 43 computed and 413 specified resources...
    building 450 concrete resources...
    writing package resource entries...
    rolling up assets...
    writing 328575 chars to ~app_build/app_base.js
    linking build targets...
    skipping link for missing file '~app_build/app_base.min.js'
    skipping link for missing file '~app_build/app_base.min.js.gz'
    skipping link for missing file '~app_build/app_base.min.js.br'
    build assets linked successfully.
    building project documentation...
    Task complete: 24045ms.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

