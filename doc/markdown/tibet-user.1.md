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
