{{topic}}({{section}}) -- freezes the current project's TIBET library
=============================================

## SYNOPSIS

`tibet freeze [--tibet <bundle>] [--minify] [--all] [--source] [--standalone] [--zipped] [--brotlied]`

## DESCRIPTION

NOTE: this command will be removed in a future release once splitting
of the TIBET npm package into `tibet-cli` and `tibet` is complete.

Freezes the current application's TIBET library in `~app_inf` by copying the
current TIBET library code to `~app_inf/tibet` rather than using a link.

By default `~app_inf` refers to `TIBET-INF`, the default location for
package data, custom commands, etc. TIBET is configured to allow
a version of TIBET to be frozen into `TIBET-INF/tibet` rather than
in `node_modules/tibet` to support deployments where the use of the
`node_modules` directory would be unnecessary or excessive.

Flags allow you to control the scope of what is frozen. Since the
freeze command is only concerned with the TIBET library these flags
focus on whether you want minified TIBET bundles, all TIBET bundles,
raw source for dynamic development, or some combination of those.

Using `tibet freeze` without parameters will freeze the current copy
of `tibet_base.min.js` along with the load and hook files needed to boot.

## OPTIONS

  * `--tibet` :
    Takes a bundle name minus any `tibet_` prefix For example, `--tibet full`
will freeze the `tibet_full` bundle. This flag defaults to the value `base` so
`tibet_base` is frozen.

  * `--all` :
    Overrides any filtering of bundle content and preserves all bundles of TIBET
source found in the `~lib_build` directory.

  * `--minify` :
    Controls whether you freeze minified source code and is used in conjunction
with the `--tibet` flag to filter bundles. The default value is true, so only
minified code is frozen by default.

  * `--source` :
    Causes the current TIBET source tree to be copied into the target directory.
This option supports dynamic development with TIBET source code but does have a
performance impact.

  * `--standalone` :
    Packages a completely standalone environment that will allow an application
to use not only TIBET client code, but TDS server and TIBET CLI code all bundled
within a standalone package.

  * `--zipped` :
    Controls whether zipped copies are preserved or pruned. This flag works
after any minify processing so if you set both minify and zipped you will retain
`.min.js.gz` files.

  * `--brotlied` :
    Controls whether brotlied copies are preserved or pruned. This flag works
after any minify processing so if you set both minify and brotlied you will
retain `.min.js.br` files.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Freeze a project's TIBET resources (...but maybe not...)

    $ tibet freeze

    mkdir: path already exists: /Users/ss/temporary/test1/public/TIBET-INF/tibet

    Project already frozen. Use --force to re-freeze.

### Freeze a project's TIBET resources (...and really do it...)

    $ tibet freeze --force

    freezing packaged library resources...
    freezing library dependencies...
    freezing runtime library resources...
    freezing developer tool resources...
    updating embedded lib_root references...
    updating project lib_root setting...
    Application frozen. TIBET now boots from ~app/TIBET-INF/tibet.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-thaw(1)
