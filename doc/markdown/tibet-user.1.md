{{topic}}({{section}}) -- adds/updates user configuration data
=============================================

## SYNOPSIS

tibet user <username> <password>

## DESCRIPTION

Manages and/or displays current TIBET user configuration data.

The TIBET Data Server (TDS) uses a simple default authentication model
which relies on usernames and hashed passwords stored in the tds.json
file loaded by the server when it starts. While this is clearly not a
production-capable approach it does allow you to experiment with logins.

This command lets you list, add, or update user data stored in tds.json
such that the resulting data will work properly with default authenticate
logic from the TDS plugin catalog.

NOTE that if you use this command to set values it will rewrite tds.json
by using the beautify npm module to process the stringified JSON content.
As a result your file may not retain its appearance after updates.

## OPTIONS

  * `username` :
    The username to define or verify.

  * `--env` :
    Provides a way to specifically target a particular environment such as
`development` within a configuration file.

  * `--pass` :
    Flag to use to set a password for a particular user.

## EXAMPLES

### Check to see if a particular user has been defined

    $ tibet user fluffy

    User was found.

### Define a new user

    $ tibet user fuzzy --pass tooeasytoguess

    User added.

Note that passwords are hashed in the `tds.json` file so they are not stored in
plain text.

    $ cat tds.json

    {
        "cli": {
            "color": {
                "debug": "green"
            }
        },
        "use": {
            "proxy": true,
            "tasks": true,
            "watch": true
        },
        "users": {
            "fluffy": "42d388f8b1db997faaf7dab487f11290",
            "fuzzy": "31234aa2aeadb4b73008a97c4f7d43b7"
        }
    }

