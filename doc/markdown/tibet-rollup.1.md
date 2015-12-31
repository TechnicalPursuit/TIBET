{{topic}}({{section}}) -- concatenates a package#config's resources
=============================================

## SYNOPSIS

    tibet rollup

## DESCRIPTION

Creates a minified and concatenated version of a package#config.

Output from this command is written to stdout for use in redirection.
By default the output is not minified, but it does it contain filename
data (aka 'headers') to assist TIBET by providing file load metadata.

You can minify output via the --minify flag, and turn off headers via
--no-headers should you choose. Normally these flags are managed by one
or more makefile.js targets used to build library or app-level bundles.
See https://github.com/estools/escodegen/wiki/API for minify options.

<package-opts> refers to options for the 'tibet package' command.


