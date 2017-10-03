{{topic}}({{section}}) -- runs various lint tools on package files
=============================================

## SYNOPSIS

tibet lint [[--filter] <filter>] [--scan] [--stop] [package-opts] [eslint-opts]

## DESCRIPTION

Runs a variety of lint tools on files specified in a TIBET package.

The optional `filter` argument provides a string or regular expression
used to filter file names. If the filter begins and ends with / it is
treated as a regular expression for purposes of file filtering.

[package-opts] refers to valid options for a TIBET Package object and help
determine which subset of the application's manifests should be targeted. These
include --package, --config, --phase, --assets, etc. The package@config defaults
to `~app_cfg/main.xml` and its default config (usually @base) so your typical
configuration is linted. See help on the `tibet package` command for more
information.

--scan overrides any package options and causes the lint command to scan the
filesystem rather than using package configuration entries to determine the file
set to process.

--stop tells the lint process to stop running after the first error condition,
supporting a fast-fail approach for build scripts etc.

[eslint-opts] refers to --esconfig, --esrules, and --esignore which
let you configure eslint to meet your specific needs. The linter will
automatically take advantage of a `.eslintrc` file in your project.

[stylelint-opts] refers to --styleconfig which allows you to specify a
`.stylelintrc` file whose content should be used. The lint command relies on
`.stylelintrc` as used by the styleline command (installed separately). The
default file is the one in your project.

All of the linters can be disabled individually by using a `--no-` prefix.
For example: --no-style --no-js --no-json --no-xml will turn off all the
currently supported linters.


## OPTIONS

  * `--scan` :
    Tells the linter to scan the directory tree and ignore any package@config
specification. Without this flag only files found in the project package files
will be linted, making it easy to lint only those files your project actually
makes direct use of.

  * `--quiet` :
    Tells the linter to suppress warnings if possible.

  * `--stop` :
Tells the linter to stop after the first file with errors.

## EXAMPLES

### Lint all package-referenced files in an application

    $ tibet lint

    0 errors, 0 warnings in 14 of 14 files.

### Lint all files in an application directory tree

    $ tibet lint --scan

    0 errors, 0 warnings in 97 of 97 files.

### Lint a specific file, package-mentioned or otherwise

    $ tibet lint --scan --filter /makefile/

    /Users/ss/temporary/todomvc/public/TIBET-INF/cmd/makefile.js
      106:13   warn    'dir' is defined but never used                                no-unused-vars
      112:27   error   Unexpected trailing comma.                                     comma-dangle
    1 errors, 1 warnings in 1 of 1 files.

## SEE ALSO

  * tibet-doclint(1)
