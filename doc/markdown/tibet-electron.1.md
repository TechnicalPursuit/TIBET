{{topic}}({{section}}) -- start a TIBET electron application
=============================================

## SYNOPSIS

`tibet electron [<path>|--empty] [--debugger] [--devtools]
    [<electron options>]`

## DESCRIPTION

Starts an Electron application by invoking the Electron binary with appropriate
ocmmand line arguments and flags.

By default the file `electron.js` in the standard TIBET electron project dna is
launched. This file is similar in scope and content to the default file you'll
find in Electron's standard `electron-quick-start` project.

You can use the `--devtools` flag, specific to TIBET's version of 'electron.js',
to let the logic in that file determine whether to open Chrome DevTools or not
on startup.

The `--debugger` flag is a common flag in TIBET which will add `inspect-brk` to
the command line so the application is launched with debugger access to the main
process.

The `--empty` flag offers a way to open an empty Electron application shell.
This command option will let you see the full set of Electron command line
options in the console and will open a clean Electron environment. This command
option overrides any supplied path.

All other command line arguments are passed as-is to the Electron binary. See
the output from the `--empty` flag version for Electron's description of these
options.

## OPTIONS

  * `debugger` :
    Add `inspect-brk` to the command line.

  * `devtools` :
    Open the application with Chrome DevTools open and active.

  * `empty` :
    Open the application without an initial page (aka empty). This will also
cause the console to output Electron's 'usage' data including all flags and
options.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Start Electron with the default page (`.`):

    tibet electron

### Start Electron with a specific start page:

    tibet electron ./index.html

### Start Electron with Chrome DevTools open:

    tibet electron --devtools

### Start Electron with the debugger active:

    tibet electron  --debugger

    Debugger listening on ws://127.0.0.1:9229/584efeb0-18cb-4e50-b12e-8b63a906b197
    For help, see: https://nodejs.org/en/docs/inspector

### Opening an empty Electron application:

    $ tibet electron --empty

    Electron 6.0.0 - Build cross platform desktop apps with JavaScript, HTML, and CSS
    Usage: electron [options] [path]

    A path to an Electron app may be specified. It must be one of the following:
      - index.js file.
      - Folder containing a package.json file.
      - Folder containing an index.js file.
      - .html/.htm file.
      - http://, https://, or file:// URL.

    Options:
      -i, --interactive     Open a REPL to the main process.
      -r, --require         Module to preload (option can be repeated).
      -v, --version         Print the version.
      -a, --abi             Print the Node ABI version.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-start(1)
