{{topic}}({{section}}) -- manages a project's HTML5 application manifest
=============================================

## SYNOPSIS

    tibet cache [--file <cachefile>] [--enable|--disable|--status] [--missing] [--develop] [--rebuild] [--touch]

## DESCRIPTION

TIBET projects include a manifest file named `{appname}.appcache` which is
managed by this command. Specific comment blocks in TIBET versions of the
manifest file help delimit the content of the file for easier processing.

Content checks are done against the files in `~app_build` and `~lib_build`.
If your application caches files outside of those directories you
must add those entries manually. *This command never removes entries* so
you can feel confident both editing the cache and using this command.

## OPTIONS

  * `--file` :
    Provides a way to point to an application manifest other than
`{appname}.appcache`. You will need this if you renamed the default app manifest
file.

  * `--enable` :
    Update `index.html` to use the proper manifest value. When active the html
element will have a `manifest` attribute, otherwise it will have a `no-manifest`
attribute (which effectively turns off caching).

  * `--disable` :
    Update `index.html` to have a `no-manifest` attribute. This attribute name
effectively will disable the cache. *NOTE that if the cache was ever activated
you must clear your browser's cache content and any browser-specific appcache
(chrome://appcache-internals/) to fully disable.*

  * `--develop` :
    Update the cache such that application file content is commented out so it
will load dynamically via the network. Invert the flag via `--no-develop` to
uncomment application section content to test your application running from the
cache. Note `--develop` is on by default.

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

  * `--touch` : Update the embedded ID: {timestamp} value provided by the
default cache template. This effectively changes the cache content which
should have the effect of causing your browser to refresh the cache.

