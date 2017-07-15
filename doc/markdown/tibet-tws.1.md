{{topic}}({{section}}) -- manage CouchDB databases and applications
=============================================

## SYNOPSIS

'tibet tws <cancel|disable|enable|init|list|push|remove|restart|retry|submit|validate> [<flags>]';

## DESCRIPTION

Required CouchDB parameters such as server URL and database name are first
checked against `ENVIRONMENT VARIABLES`, then against a set of TIBET
configuration values. If the `--confirm` flag is active (the default) the values
discovered are presented to you for confirmation/adjustment. Prompting can be
turned off via the `--no-confirm` flag.

    For example:

    $ export COUCH_DATABASE=dbtest_tasks
    $ export COUCH_USER={username}
    $ export COUCH_PASS={password}

    $ tibet tws


## ENVIRONMENT VARIABLES

  * `COUCH_DATABASE` :
    The name of the CouchDB database to use for operations. Normally defaults to
the project name in a TIBET+CouchDB project.

  * `COUCH_APPNAME` :
    The name of the design document (application) in the database to use for
view lookup and application-related operations. Defaults to 'tws'.

  * `COUCH_URL` :
    The URL of the CouchDB server. For example `http://127.0.0.1:5984`. This URL
can include username and password information but for more security it is
recommended you use `COUCH_USER` and `COUCH_PASS` variables instead. If you do
supply credentials be aware these values should be URL-encoded (for example
'pass/word' must be provided as 'pass%2fword'). A sample basic auth URL will
resemble the following: `http://admin:pass%2fword@127.0.0.1:5984`.

  * `COUCH_USER` :
    The username for the CouchDB server being accessed. Should be exported as a
URL-encoded value.

  * `COUCH_PASS` :
    The password for the CouchDB server account being accessed. Should be
exported as a URL-encoded value.

## CONFIGURATION SETTINGS

  * `tds.couch.scheme` :
    The CouchDB server scheme. Default is `http`.

  * `tds.couch.host` :
    The CouchDB server hostname or IP address. Default is `127.0.0.1`.

  * `tds.couch.port` :
    The CouchDB server port. Default is `5984`.

  * `tds.couch.db_name`:
    The CouchDB database name to use. Defaults to the current project name.

  * `tds.couch.app_name`:
    The CouchDB application name to use. Defaults to `tws`.

## OPTIONS

  * `--confirm` :
    Should database URL and other parameters be confirmed when provided. Default
is true. Use `--no-confirm` to disable. If you want to disable confirmations in
general you can set the TIBET configuration value `cli.tws.confirm` to false.

## EXAMPLES





## TROUBLESHOOTING

During any operation if you receive a message including output to the effect
that `You are not a server admin.` either export the the proper environment
variables or provide your credentials in your `CouchDB url` prompt response.

## SEE ALSO

  * tws(1)
