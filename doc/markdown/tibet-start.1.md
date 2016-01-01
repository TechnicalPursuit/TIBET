{{topic}}({{section}}) -- starts the project's TIBET Data Server
=============================================

## SYNOPSIS

    tibet start

## DESCRIPTION

Starts the project's TIBET Data Server, if available.

Many TIBET dna templates provide a simple Node.js-based server. If
the current project contains either a server.js file or can invoke
'npm start' this command will try to start that server.

The optional --env parameter lets you specify an environment setting
such as `development` or `production`. The default is development.
The current setting is announced in the server startup banner

The --tds.port parameter lets you specify a port other than
the registered TIBET Data Server port (which is port 1407).

If your server includes TDS features you can optionally add
command-line parameters to provide the various modules of the TDS
with config data. All values for the tds are supported. See the
output of `tibet config tds` for a list of current options.

