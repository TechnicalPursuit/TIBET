{{topic}}({{section}}) -- starts the project's TIBET Data Server
=============================================

## SYNOPSIS

`tibet start [--env <name>] [--debug]
    [--level=['all'|'trace'|'debug'|'info'|'warn'|'error'|'fatal'|'system'|'off']]
    [--debugger] [--port N] [--color[=true|false]] [--no-color]
    [--https] [--https_port N]
    [<options>]`

## DESCRIPTION

Performs project-specific start operations.

For a TDS-based project this command will attempt to start the TDS by running
the file `server.js` in your project root dirctory.

For an Electron project this command will delegate to the `tibet electron`
command to launch your Electron project with appropriate flags.

For other project types this command will typically call the current operating
system's `open` command with your `project.start_page` value. This last option
will rarely work given modern browser security but is still included for
historical reasons.

You can also start your project using `npm start`, however that does not provide
as many options for passing additional options as needed.

For typical TDS-based projects the `server.js` file will attempt to load a
series of plugins from the `~/plugins` directory. The list itself is determined
by the `tds.plugins.core` list but normally involves a list such as:

    body-parser
    logger
    compression
    reconfig
    public-static
    session
    security
    view-engine
    authenticate
    private-static
    routes
    tds
    user
    proxy
    fallback
    errors

## OPTIONS

  * `--env` :
    Specify an environment value to control the server. This value is used by
the system when loading values from `tds.json`, the server's config file. Common
values are `development` (the default), and `production`.

  * `--debug` :
    Sets the server's logging level to 'debug'.

  * `--level` :
    Sets the server's logging level to the supplied level.

  * `--debugger` :
    A flag which causes the hosting server to start in a debugging mode, waiting
for a Node-compatible debugger to 'attach' itself to the process.

  * `--port` :
    A flag which alters the port number the server should start on.

  * `--color` :
    A flag which determines whether the output from this command will be
colorized. You can use `--no-color` as an alternative to using `false` here.

  * `--https` :
    Whether or not the server should start in https mode.

  * `--https_port` :
    A flag which alters the port number the server should start on when the
server is started in https mode.

## CONFIGURATION SETTINGS

  * `--project.start_page`:
    The initial page to be opened when no `server.js` file or `electron.js`
files are found in the project root.

  * `tds.cert.path`:
    Read by `server.js`. The directory where certificate information can
be found if running with HTTPS.

  * `tds.cert.key`:
    Read by `server.js`. The name of the certificate key file to use if running
with HTTPS.

  * `tds.cert.file`:
    Read by `server.js`. The name of the actualy cert file to use if running
with HTTPS.

  * `tds.https`:
    Read by `server.js` to determine if HTTPS should be used. Default is false.

  * `tds.https_port`:
    Read by `server.js` to determine what port to use for HTTPS operation. The
default is 443.

  * `tds.plugins.core`:
    Read by `server.js`. Defines the list of plugins to load and in what order.

  * `tds.port`:
    Read by `server.js`. Defines the default port if there is no port on the
command line or in the environment. The default is 1407.

  * `tds.secure_requests`:
    Read by `server.js`. If the server is not HTTPS but is running behind
`nginx` or another secure proxy this flag should be set to properly manage
redirections.

  * `tds.stop_onerror`:
    Read by `server.js`. If true, the server will terminate on an error.

## ENVIRONMENT VARIABLES

  * `HTTPS_PORT`:
    Read by `server.js`. The HTTPS port to be used if none is specified on the command line.

  * `PORT`:
    Read by `server.js`. The HTTP port to be used if none is specified on the command line.

  * `npm_package_config_port`:
    Read by `server.js`. The port to use if no other option is configured.


## EXAMPLES

### Start the server on a default port (1407)

    $ tibet start

                                      ,`
                                __,~//`
       ,///,_            .~////////'`
      '///////,       //////''`
             '//,   ///'`
                '/_/'
                  `
        ////////////////////     ///////////////////  ////
        `//'````````````///      `//'```````````````  '''
         /`              //       /'
        /                //      '/
       ,/____             /'    ,/_____
      /////////;;,,_      //   ,//////////;,_
                  `'/,_   '/              `'///,_
                     `'/,_ /                   '//,
                        '/,/,                    '/_
                          `/,                     `/,
                            '                      `/
                                                   '/
                                                    /

    info: hello 0.1.0 (development) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:1407

### Start the server on a custom port

    $ tibet start --tds.port 2222

    ...
    info: test1 0.1.0 (development) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:2222

### Start the server with a different environment

    $ tibet start --env testing

    ...
    info: hello 0.1.0 (testing) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:1407


## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-electron(1)
  * tibet-tds(1)
