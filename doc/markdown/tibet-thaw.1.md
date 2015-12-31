{{topic}}({{section}}) -- thaws a frozen project's TIBET library reference
=============================================

## SYNOPSIS

    tibet thaw --force

## DESCRIPTION

Thaws (un-freezes) the current application's TIBET library in ~app\_inf.

By default ~app\_inf refers to TIBET-INF, the default location for
package data, custom commands, etc. TIBET is configured to allow
a version of TIBET to be frozen into TIBET-INF/tibet rather than
in node\_modules/tibet to support deployments where the use of the
node\_modules directory would be unnecessary or excessive.

The thaw command removes any ~app\_inf/tibet content and returns the
setting for lib\_root to its default value of ~/node\_modules/tibet.

Since it is inherently destructive this command requires --force to
actually run.
