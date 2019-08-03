{{topic}}({{section}}) -- deploys an application
=============================================

## SYNOPSIS

tibet deploy <helper> [<options>]

## DESCRIPTION

Deploys the current application by leveraging a deploy 'helper' or any
available `tibet make deploy` target. You can build your own deploy
helper(s) and place them in your application's `~app_cmd/deploy` directory
for use by this command.

There are several pre-built deploy helpers in `~lib_cmd/deploy` including:
    awselasticbeanstalk
    azurewebapps
    dockerhub
    shipit

Each helper is free to process any additional command line arguments and flags
in whatever fashion makes the most sense given the deployment target.

## OPTIONS

  * `options` :
    An open-ended set of arguments and flags. Any content on the command line
can be accessed from within your `deploy` helper or make target.

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

    To run a `shipit`-based deployment via the `tibet deploy` command
enter `tibet deploy shipit <environment>` along with any options you require.

### Using `tibet make deploy` for deployments

    To use a `tibet make` target you need to edit the `_deploy` task in your
project's `~app_cmd/make` directory. The default version of this file simply
outputs a message regarding concrete deployment logic.

    Deploying via your `makefile.js`-based `deploy` target is as simple as
entering `tibet deploy make` once you've updated your make target file to
contain your deployment logic.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-make(1)

