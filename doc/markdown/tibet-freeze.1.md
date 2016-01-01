{{topic}}({{section}}) -- freezes the current project's TIBET library
=============================================

## SYNOPSIS

    tibet freeze [--tibet <bundle>] [--minify] [--all] [--raw] [--zipped]

## DESCRIPTION

Freezes the current application's TIBET library in `~app_inf`.

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

  * `--link` :
    Attempt to use symbolic links rather than a full recursive copy. This is
useful if you are working with a live TIBET installation and need a frozen
structure to boot properly but do not want to have your library code truly
frozen for development.

  * `--minify` :
    Controls whether you freeze minified source code and is used in conjunction
with the `--tibet` flag to filter bundles. The default value is true, so only
minified code is frozen by default.

  * `--zipped` :
    Controls whether zipped copies are preserved or pruned. This flag works
after any minify processing so if you set both minify and zipped you will retain
`.min.js.gz` files.

  * `--all` :
    Overrides any filtering of bundle content and preserves all bundles of TIBET
source found in the `~lib_build` directory.

  * `--raw` :
    Causes the current TIBET source tree to be copied into the target directory.
This option supports dynamic development with TIBET source code but does have a
performance impact.

