{{topic}}({{section}}) -- runs a function as a task
=============================================

## SYNOPSIS

tibet make <target> [--list] [--private] [--timeout <ms>]

## DESCRIPTION

This command runs lightweight commands in the form of functions, much like Grunt
or Gulp. There's no dependency checking or true 'make'-like functionality but
`tibet make` does leverage JavaScript Promises to coordinate tasks and their
interactions, particularly when calling nested or asynchronous tasks.

TIBET provides a set of default functions for `make` which support basic
operations such as `clean`, `build`, and `rollup` that are common in TIBET
applications. By providing these commands as make targets it's easy for you to
modify them to meet your specific project requirements.

When you use the `tibet` command all available make targets are checked if no
concrete command is found. For example, you can run `tibet clean` and, since
there is no concrete `clean` command the `tibet` command will delegate to the
`tibet make clean` operation.

## OPTIONS

  * `--list` :
    Used to list the available `tibet make` targets you can run.

  * `--private` :
    Tells the `--list` operation to also include private tasks, tasks whose
names begin with `_` so they are normally filtered by the list option.

  * `--timeout <ms>` :
    Gives you a way to provide a millisecond timeout value in which each task
must complete successfully. The default is 15 seconds (15000).

## CONFIGURATION SETTINGS

  * `--make.compression.parse_options`:
    Set by this command to pass command line options along to any
compression-related make operations.

  * `--make.package.parse_options`:
    Set by this command to pass command line options to any packaging-related
operations.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Sample function (the lint task in make):

    (function() {
        'use strict';

        var task;

        task = function(make, resolve, reject) {
            var proc;

            make.log('checking for lint...');

            proc = make.spawn('tibet lint --stop');
            proc.on('exit', function(code) {
                code === 0 ? resolve() : reject();
            });
        };

        task.options = {timeout: 1000 * 60 * 5};

        module.exports = task;
    }());

### List available targets

    $ tibet make

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

