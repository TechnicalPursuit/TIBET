{{topic}}({{section}}) -- runs various lint tools on package files
=============================================

## SYNOPSIS

tibet lint [[--filter] <filter>] [--force] [--nodes] [[--style] [--js] [--json] [--xml] [--only]] [--quiet] [--scan] [--stop] [package-opts] [eslint-opts] [stylelint-opts]

## DESCRIPTION

Runs a variety of lint tools on files specified in a TIBET package.

The optional `filter` argument provides a string or regular expression
used to filter file names. If the filter begins and ends with / it is
treated as a regular expression for purposes of file filtering.

`--force` overrides any information found in .tibelint.json which would otherwise
keep lint from looking at files it thinks haven't changed since the last run.
This is a flag you should always include in your CI / build configurations.

`--scan` overrides any package options and causes the lint command to scan the
filesystem rather than using package configuration entries to determine the file
set to process.

`--stop` tells the lint process to stop running after the first error condition,
supporting a fast-fail approach for build scripts etc.

`--nodes` tells the linter to use the package node `src` and/or `href` values to
locate files. This is the default as opposed to `--scan` which looks at the file
system for raw files by extension.

The various "extension" flags (`--js`, `--json`, `--style`, `--xml`) tell lint
whiich file types you want to scan. By default all are checked. You can combine
any one of these flags with `--only` to lint only that type of file.

`[package-opts]` refers to valid options for a TIBET Package object and help
determine which subset of the application's manifests should be targeted. These
include `--package`, `--config`, `--phase`, `--context`, etc. The targeted
package@config defaults to `~app_cfg/main.xml` and its default config (usually
`base`). See help on the `tibet package` command for more information.

`[eslint-opts]` refers to `--esconfig`, `--esrules`, and `--esignore` which
let you configure `eslint` to meet your specific needs. The linter will
automatically take advantage of a `.eslintrc` file in your project.

`[stylelint-opts]` refers to `--styleconfig` which allows you to specify a
`.stylelintrc` file whose content should be used. The lint command relies on
`.stylelintrc` as used by the styleline command (installed separately). The
default file is the one in your project.

All of the linters can be disabled individually by using a `--no-` prefix.
For example: `--no-style --no-js --no-json --no-xml` will turn off all
the currently supported linters.

## OPTIONS

  * `--force`:
    Tell the linter to ignore any `tibetlint.json` file content which would
limit the check to only changed files. With `--force` set all files will be
checked even if they haven't changed since the last lint pass.

  * `--nodes` :
    Tell the linter not to scan but instead to use the nodes from the
package@config and use their `src` or `href` values to determine the list of
files to be checked.

  * `--only` :
    Tell the linter to only check the specific file types provided by one of the
other flags such as `--js`, `--json`, `--style`, or `--xml`.

  * `--quiet` :
    Tells the linter to suppress detailed warnings if possible.

  * `--scan` :
    Tells the linter to scan the directory tree and ignore any package@config
specification. Without this flag only files found in the project package files
will be linted, making it easy to lint only those files your project actually
makes direct use of.

  * `--stop` :
    Tells the linter to stop after the first file with errors.

## CONFIGURATION SETTINGS

  * `boot.deafult_package`:
    Read if no other default package information is available.

  * `cli.lint.js_extensions`:
    The list of extensions used to scan for JavaScript source files.

  * `cli.lint.style_extensions`:
    The list of style sheet extensions used to scan for style information.

  * `cli.lint.xml_extensions`:
    The list of XML file extensions to scan when looking for XML files.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## FILES

  * `tibetlint.json`:
    A file containing information on the last lint run. This file is used when
the `--force` flag is not set to determine timestamp and/or list of files to be
checked:

    {
        "linty": 1,
        "errors": 0,
        "warnings": 1,
        "checked": 13,
        "unchanged": 0,
        "filtered": 1,
        "files": 14,
        "recheck": ["/Users/ss/temporary/hello/public/src/tags/APP.hello.app/APP.hello.app.js"],
        "lastrun": 1564939681906
    }


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


## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-doclint(1)
