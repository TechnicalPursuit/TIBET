{{topic}}({{section}}) -- runs a TIBET makefile.js target
=============================================

## SYNOPSIS

    tibet make <target>

## DESCRIPTION

Runs a target function in a TIBET `makefile.js` file via a JS Promise.

This command supports lightweight commands in the form of functions, much
like Grunt or Gulp. There's no dependency checking or true 'make'-like
functionality but `makefile.js` code does leverage JavaScript Promises to
coordinate tasks and their interactions, particularly when calling tasks
within tasks and when dealing with asynchronous tasks.

## OPTIONS

  * `--list` :
    Used to list the available `makefile.js` targets you can run.

  * `--timeout <ms>` :
    Gives you a way to provide a millisecond timeout value in which each task
must complete successfully. The default is 15 seconds (15000).
