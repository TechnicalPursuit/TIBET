{{topic}}({{section}}) -- manages a project's HTML5 application manifest
=============================================

## SYNOPSIS

tibet appcache [--file <cachefile>] [--enable|--disable|--status]
    [--missing] [--develop] [--rebuild] [--touch] [--context <app|lib|all>]

## DESCRIPTION

Manages a project's HTML5 application manifest file for offline caching.

!!! NOTE: the older appcache approach supported by this command is being removed
from the browser platform(s) over the coming years. This command will be updated
to support the newer manifest approach in an upcoming release. !!!

TIBET projects include a manifest file named `{npm.name}.appcache` which is
managed by this command. Specific comment blocks in TIBET versions of the
manifest file help delimit the content of the file for easier processing.

When used without flags this command will default to `--status` and will report
the current state of the application cache file (enabled, disabled, etc).

*This command never removes entries* so you can feel confident both editing the
cache and using this command.

## OPTIONS

  * `--context` :
    Sets the context of the package scan which is run. The default is `app`
which scans only application-level resources, ignoring any potential library
resources. Other values are `lib` and `all` but for most application uses these
options are not useful.

  * `--develop` :
    Update the cache such that application-specific content is commented out so
it will load dynamically via the network. Invert the flag via `--no-develop` to
uncomment application section content to test your application running from the
cache. Note `--develop` is on by default.

  * `--disable` :
    Update `index.handlebars` to have a `no-manifest` attribute. This attribute
name effectively will disable the cache. *NOTE that if the cache was ever
activated you must clear your browser's cache content and any browser-specific
appcache (for example: chrome://appcache-internals/) to fully disable.*

  * `--enable` :
    Update `index.handlebars` to use the proper manifest value. When active the
html element will have a `manifest` attribute, otherwise it will have a
`no-manifest` attribute (which effectively turns off caching).

  * `--file` :
    Provides a way to point to an application manifest other than
`{appname}.appcache`. You will need this if you renamed the default app manifest
file.

  * `--missing` :
    List files in the application not in the manifest. This is a relatively
simple scan looking for css, image, and other non-source files which might be
useful to cache. For JavaScript the system presumes that only source files in
`~app_build` should be part of the cache.

  * `--rebuild` :
    Refresh the app and lib sections of the manifest. This is the only flag
which edits the file content of the appcache itself. If the comment delimiters
for app and lib sections are not present this operation will fail and output an
appropriate error message. Use this option with a degree of caution since it
will alter the content of your cache.

  * `--status` :
    Display the current application cache status based on the current state of
the `index.handlebars` file's `manifest` attribute. Note that this command
cannot tell you if a particular browser is still relying on cached data. This is
the default option.

  * `--touch` :
    Update the embedded ID: {timestamp} value provided by the default cache
template. This effectively changes the cache content which should have the
effect of causing your browser to refresh the cache.

## CONFIGURATION SETTINGS

  * `npm.name` :
    The project name, used to locate the cache file by name.

  * `project.start_page` :
    The project's start page, usually `index.html`. This is the file updated
with the manifest attribute necessary to enable/disable the cache.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Checking application cache status

    $ tibet appcache

    checking application cache status...
    Application cache explicitly disabled.

### Checking for missing application files

    $ tibet appcache --missing

    checking application cache content...
    missing check only. no changes will be saved...
    No build files missing, no obsolete files.

### Enabling the application cache

    $ tibet appcache --enable

    checking application cache status...
    updating cache status...
    Remember first launch after enable initializes the cache.
    Application cache enabled.

### Disabling the application cache

    $ tibet appcache --disable

    checking application cache status...
    updating cache status...
    Clear chrome://appcache-internals/ etc. to fully disable.
    Application cache disabled.

### Versioning the application cache

    $ tibet appcache --touch

    checking application cache content...
    updating cache ID value...
    Application cache stamped with ID: 1467309265306

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING

### Enable/Disable

If the enable/disable machinery is failing check your `project.start_page` and
verify the `manifest` or `no-manifest` attribute is present as expected:

```
<html xmlns="http://www.w3.org/1999/xhtml" no-manifest="./hello.appcache">
```

### Cache File

The basic format of the cache file used by TIBET is shown below. You can
manually edit this file as needed, just respect the initial comments about
formatting TIBET uses to help it process the file.

```
CACHE MANIFEST

# ---
# !!! TIBET-managed appcache. Do not remove comment blocks of this form.
# ---

## You can have comments ignored by prefixing ala: # !!!, # ---, or ##.
## It is recommended that you not alter the section headings or # !!!
## comments since those help guide the 'tibet cache' command operation.


CACHE:
# !!! lib

...snipped...

# --- don't cache multiple copies of TIBET, only the desired one(s)

...snipped...

CACHE:
# !!! app

...snipped...

# --- don't cache multiple copies of APP, only the desired one(s)

# --- NOTE: do not uncomment until after a build. If there are any
# --- 404 result codes the appcache is NOT used.

...snipped...

NETWORK:
*


FALLBACK:

# ---
# !!! ID: 1467147560253
# ---
```

## SEE ALSO

  * tibet-package(1)
  * tibet-resources(1)
