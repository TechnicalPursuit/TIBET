{{topic}}({{section}}) -- open a file using the OS open command
=============================================

## SYNOPSIS

tibet open <vpath[:file[:char]]> [--editor <cmd>]

## DESCRIPTION

Attempts to open the specified file on the operating system using the editor
provided, or the editor specified by `cli.open.editor`.

This command is typically invoked from the Sherpa when running on the local
machine. It allows the Sherpa to open a file under development in `vi` or
`VisualStudio Code` for example.

## OPTIONS

  * `vpath[:file[:char]]`:
    An editor-specific file path, line, character specification. This argument
is run through TIBET's expandPath operation to expand any virtual path portions.

  * `editor`:
    The command name of the editor to try to launch on the local machine.

## CONFIGURATION SETTINGS

  * `cli.open.editor`:
    The default editor command to try to launch.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES


## TIBET SHELL

This command is invoked by the client-side TSH `:open` command.

The client-side `:open` command is a simple argument marshalling operation which
creates the proper arguments for a TDS route call and then passes it to the TDS
via a secure "only if running on the same host" and "only if running in
development" route (which is never loaded outside of development).

## TROUBLESHOOTING


## SEE ALSO

