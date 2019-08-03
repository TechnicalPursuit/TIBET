{{topic}}({{section}}) -- runs a TIBET makefile.js target
=============================================

## SYNOPSIS

tibet make <target> [--list]

## DESCRIPTION

Runs a target function in a TIBET `makefile.js` file via a JS Promise.

This command supports lightweight commands in the form of functions, much
like Grunt or Gulp. There's no dependency checking or true 'make'-like
functionality but `makefile.js` code does leverage JavaScript Promises to
coordinate tasks and their interactions, particularly when calling tasks
within tasks and when dealing with asynchronous tasks.

TIBET provides a default `makefile.js` which supports basic operations such as
clean, build, and rollup that are common in TIBET applications. By providing
these commands as make targets it is easy for you to modify them to meet your
specific project requirements.

## OPTIONS

  * `--list` :
    Used to list the available `makefile.js` targets you can run.

  * `--timeout <ms>` :
    Gives you a way to provide a millisecond timeout value in which each task
must complete successfully. The default is 15 seconds (15000).

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### List available makefile.js targets

    $ tibet make --list

    Available targets:

        build checkup clean deploy resources rollup

### Run a make target explicitly

    $ tibet make clean

    cleaning...
    Task complete: 7ms.

### Run a make target implicitly

    $ tibet clean

    Delegating to 'tibet make clean'
    cleaning...
    Task complete: 4ms.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-build(1)
  * tibet-deploy(1)

