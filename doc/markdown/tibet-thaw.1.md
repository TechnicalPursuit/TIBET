{{topic}}({{section}}) -- thaws a frozen project's TIBET library reference
=============================================

## SYNOPSIS

tibet thaw [--force]

## DESCRIPTION

Thaws (un-freezes) the current application's TIBET library in `~app_inf`.

By default `~app_inf` refers to `public/TIBET-INF`, the default location for
package data, custom commands, etc. TIBET is configured to allow a version of
TIBET to be frozen into `~app_inf/tibet` rather than in `node_modules/tibet` to
support deployments where the use of the `node_modules` directory would be
unnecessary or excessive.

The thaw command removes any `~app_inf/tibet` content and returns the
setting for `lib_root` to its default value of `~/node_modules/tibet` where the
`~` in this case represents your project's root directory.

Since it is inherently destructive this command requires `--force` to
actually run.

## OPTIONS

  * `--force` :
    Required to actually cause a thaw operation to be performed.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Thaw a previously frozen project (...but not really...)

    $ tibet thaw

    Use --force to confirm destruction of ~app_inf/tibet.

### Thaw a previously frozen project (...and really do it...)

    $ tibet thaw --force

    updating embedded lib_root references...
    updating project lib_root setting...
    Application thawed. TIBET now boots from ~/node_modules/tibet.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-freeze(1)
