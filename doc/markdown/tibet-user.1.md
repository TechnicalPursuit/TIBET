{{topic}}({{section}}) -- adds/updates user configuration data
=============================================

## SYNOPSIS

tibet user <username> <password>

## DESCRIPTION

Manages and/or displays current TIBET user configuration data.

The TIBET Data Server (TDS) uses a simple default authentication model
which relies on usernames and hashed passwords stored in the users.json
file loaded by the server when it starts. While this is clearly not a
production-capable approach it does allow you to experiment with logins.

This command lets you list, add, or update user data stored in users.json
such that the resulting data will work properly with default authenticate
logic from the TDS plugin catalog.

NOTE that if you use this command to set values it will rewrite users.json
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
