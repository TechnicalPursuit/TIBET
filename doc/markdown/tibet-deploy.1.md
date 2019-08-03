{{topic}}({{section}}) -- deploys an application via `shipit` or `tibet make`
=============================================

## SYNOPSIS

tibet deploy [<environment>] [<options>]

## DESCRIPTION

Deploys the current application by leveraging `shipit` or `tibet make deploy`.

The concrete deployment logic itself is found in either a `shipitfile.js` file
appropriate for use via `shipit` or in a TIBET `makefile.js` target named
`deploy` which will be executed by this command.

For shipit-related deployment you are responsible for creating and maintaining
your deployment environments and their options. `tibet deploy` will simply
invoke `shipit` and target a specified `environment`. See the Shipit
documentation at (`https://github.com/shipitjs/shipit`) for more info.

For `tibet make`-based deployment your application may already include basic
deployment logic in `~app_cmd/makefile.js`. You can adjust the `deploy` target
in your TIBET makefile to support whatever deployment task(s) you require.

## OPTIONS

  * `environment` :
    A shipit environment name to be targeted by the deploy. Only required when
using `tibet deploy` in a Shipit-enabled project.

  * `options` :
    An open-ended set of arguments and flags. Any content on the command line
can be accessed from within your `deploy` make target.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Using Shipit for deployments

    To make use of Shipit for your deployment logic first do three things:

    1 Install the `shipit` executable via `npm install --save-dev shipit`.
    2 Install the shipit `deploy` task via `npm install --save-dev shipit-deploy`.
    3 Create a `shipitfile.js` file containing your specific deployment tasks.

    To run a `shipit`-based deployment via the `tibet deploy` command simply
    enter `tibet deploy <environment>`.

### Using `tibet make deploy` for deployments

    To use a `tibet make` target you need to edit the `deploy` task found in
    your project's default `makefile.js` file. This file is typically found in
    the `~app_cmd` directory (`public/TIBET-INF/cmd`).

    Deploying via your `makefile.js`-based `deploy` target is as simple as
    entering either `tibet deploy` or `tibet make deploy`.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-make(1)

