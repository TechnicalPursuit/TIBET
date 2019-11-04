{{topic}}({{section}}) -- adds/updates user configuration data
=============================================

## SYNOPSIS

`tibet user <username> <password> [--env <env>]
    [--role <role|roles>] [--org <org|orgs>] [--unit unit]`

## DESCRIPTION

!!! NOTE: this command and the file(s) it manages are NOT SECURE and should
never be used in production. This command is provided for convenience to let you
simulate users, roles, orgs, and units during development only. !!!

Manages and/or displays current TIBET user configuration data in the form of a
user file and one or more associated vcards, one per username.

This command lets you add, or update user data stored in `~user_file` (usually
`users.json`) such that the resulting data will work properly with default
lightweight authentication logic from the TDS.

When you add a new user that user will have a vcard generated for them and
stored in `~app_dat/{username}_vcard.xml`. If you specify an existing user that
user's vcard is updated with any new data provided.

A user's vcard is sent to the client by the TDS in response to requests when
that user logs in, providing the client with role, org, and unit data.

NOTE that if you use this command to set values it will rewrite the user file by
using the beautify npm module to process the stringified JSON content. As a
result your file may not retain its appearance after updates.

## OPTIONS

  * `username` :
    The username to define or verify.

  * `--env` :
    Provides a way to specifically target a particular environment such as
`development` within a configuration file.

  * `--pass` :
    Flag to use to set a password for a particular user.

  * `--role` :
    One or more role names, separated by commas. The resulting set of roles is
injected into the user's associated vcard.

  * `--org` :
    One or more org names, separated by commas. The resulting set of orgs is
injected into the user's associated vcard.

  * `--unit` :
    A unit name. If you're using a unit you should supply only a single org.


## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Check to see if a particular user has been defined

    $ tibet user fluffy

    User was found.

### Define a new user

    $ tibet user fuzzy --pass tooeasytoguess

    User added.

Note that passwords are hashed and encrypted in the `users.json` file so they
are not stored in plain text.

    $ cat users.json
    {
        "default": {},
        "development": {
            "guest": "a3bc2645acb9cf7051998cb6b7539b79253d67cadb4a1c514e077b882a1b17bc",
            "fluffy": "a468ebdb2000c154dad108949333a588d7545efa86d3beb673349223e43cb9ed",
            "testy": "e9381a7cef0756c6c57c41e80ac491a48b37df21300b0180a635117061c9e9fd"
        }
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

