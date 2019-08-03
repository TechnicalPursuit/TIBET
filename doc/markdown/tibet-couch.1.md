{{topic}}({{section}}) -- manage CouchDB databases and applications
=============================================

## SYNOPSIS

tibet couch <compactdb|createdb|listall|pushapp|removeapp|removedb|view> [<args>]

## DESCRIPTION

Interacts with CouchDB to provide command line data access and admin utilities.
Particularly helpful for TIBET applications which rely on CouchDB for data or
TIBET Workflow System functionality.

The various subcommands are largely self-describing in that they compact,
create, list, push an app, remove an app, delete, and query a database
respectively. See the `EXAMPLES` for more information.

Required CouchDB parameters such as server URL, database name, and application
name are first checked against `ENVIRONMENT VARIABLES`, then against a set of
TIBET configuration values. If the `--confirm` flag is active (the default) the
values discovered are presented to you for confirmation/adjustment. Prompting
can be turned off via the `--no-confirm` flag.

    For example:

    $ export COUCH_DATABASE=dbtest_tasks
    $ export COUCH_APPLICATION=tws
    $ export COUCH_USER={username}
    $ export COUCH_PASS={password}
    $ export COUCH_KEY={api_key}  # optional

    $ tibet couch view tasks --keys
    CouchDB url [http://127.0.0.1:5984] ?
    using base url 'http://127.0.0.1:5984'.
    Database name [dbtest_tasks] ?
    Application name [tws] ?

    ["s3::Team TIBET", "sample::DEFAULT", "sample::Team TIBET", "sendmail::Team TIBET",
    "smtp::Team TIBET"]

## OPTIONS

  * `--confirm` :
    Should database URL and other parameters be confirmed when provided. Default
is true. Use `--no-confirm` to disable. If you want to disable confirmations in
general you can set the TIBET configuration value `cli.couch.confirm` to false.

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
    The CouchDB application name to use. Defaults to the current project name.

## ENVIRONMENT VARIABLES

  * `COUCH_DATABASE` :
    The name of the CouchDB database to use for operations. Normally defaults to
the project name in a TIBET+CouchDB project.

  * `COUCH_APPNAME` :
    The name of the design document (application) in the database to use for
view lookup and application-related operations. Defaults to project name.

  * `COUCH_URL` :
    The URL of the CouchDB server. For example `http://127.0.0.1:5984`. This URL
can include username and password information but for more security it is
recommended you use `COUCH_USER`, `COUCH_PASS`, and `COUCH_KEY` variables
instead. If you do supply credentials be aware these values should be
URL-encoded (for example 'pass/word' must be provided as 'pass%2fword'). A
sample basic auth URL will resemble the following:
`http://admin:pass%2fword@127.0.0.1:5984`.

  * `COUCH_USER` :
    The username for the CouchDB server being accessed. Should be exported as a
URL-encoded value.

  * `COUCH_PASS` :
    The password for the CouchDB server account being accessed. Should be
exported as a URL-encoded value.

  * `COUCH_KEY` :
    The API key (if used) for the CouchDB server being accessed. Should be
exported as a URL-encoded value.


## EXAMPLES

### Creating a database

    Use the `tibet couch createdb` command:

    $ tibet couch createdb dbtest
    creating database: http://127.0.0.1:5984/dbtest
    database ready at http://127.0.0.1:5984/dbtest

### Compacting a database

    Use the `tibet couch compactdb` command:

    $ tibet couch compactdb dbtest
    Compact database [http://127.0.0.1:5984/dbtest] ?
    Enter database name to confirm: dbtest
    compacting database: http://127.0.0.1:5984/dbtest
    database compacted.

### List all databases

    Use the `tibet couch listall` command:

    $ tibet couch listall
    CouchDB url [http://127.0.0.1:5984] ?
    using base url 'http://127.0.0.1:5984'.
    _global_changes
    _metadata
    _replicator
    _users
    d2d
    dbtest

### Pushing/updating a CouchDB application

    TIBET can push content to a CouchDB design document to create a TIBET-an
    variant of a "couchapp". TIBET+CouchDB applications do not use show or list
    functions, they rely on pure Client/Server communication between CouchDB and
    the TIBET client.

    Resources used to accomplish this task are typically found in your project's
    root `couch/app` subdirectory. If you have multiple applications each will
    have it's own subdirectory containing the resources specific to that app.

    For your TIBET+CouchDB application to function properly you need to perform
    two preliminary steps: build your application, freeze a copy of the TIBET
    library minus the node_modules overhead.

    //  Build your application's packaged resources so they're available.

    $ tibet build
    Delegating to 'tibet make build'
    building app...
    removing build artifacts...
    processing resources...
    ...
    Task complete: 12331ms.

    //  Freeze a copy of the library

    $ tibet freeze --raw
    freezing packaged library resources...
    freezing library dependencies...
    freezing library support resources...
    freezing standard library docs...
    freezing raw library source...
    freezing raw library tests...
    freezing raw library demos...
    updating embedded lib_root references...
    updating project lib_root setting...
    Application frozen. TIBET now boots from ~app_inf/tibet.

    //  Push the application and library resources to CouchDB.

    tibet couch pushapp sample
    marshalling content for: http://127.0.0.1:5984/dbtest/_design/sample
    ...
    application ready at http://127.0.0.1:5984/dbtest/_design/sample/index.html


### Removing a CouchDB application

    Use the `tibet couch removeapp` command:

    $ tibet couch removeapp sample
    Delete [http://127.0.0.1:5984/dbtest/_design/sample] ?
    Enter database name to confirm: sample
    deleting http://127.0.0.1:5984/dbtest/_design/sample
    application removed.

### Removing a CouchDB database

    Use the `tibet couch removedb` command:

    $ tibet couch removedb dbtest
    Delete ENTIRE database [http://127.0.0.1:5984/dbtest] ?
    Enter database name to confirm: dbtest
    deleting database: http://127.0.0.1:5984/dbtest
    database removed.

### Querying a CouchDB view

    Use the `couch view` subcommand, which takes a dot-separated specifier for
    database.appname.viewname:

    $ tibet couch view dbtest_tasks.tws.tasks --keys
    CouchDB url [http://127.0.0.1:5984] ?
    using base url 'http://127.0.0.1:5984'.
    Database name [dbtest_tasks] ?
    Application name [tws] ?

    ["s3::Team TIBET", "sample::DEFAULT", "sample::Team TIBET", "sendmail::Team TIBET",
    "smtp::Team TIBET"]

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING

During any operation if you receive a message including output to the effect
that `You are not a server admin.` either export the the proper environment
variables or provide your credentials in your `CouchDB url` prompt response.

## SEE ALSO

  * tibet-tws(1)
