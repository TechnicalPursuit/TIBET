{{topic}}({{section}}) -- starts the project's TIBET Data Server
=============================================

## SYNOPSIS

`tibet tds start [<options>] [--env <name>]`

## DESCRIPTION

Starts the project's TIBET Data Server, if available.

Many TIBET dna templates provide a simple Node.js-based server. If
the current project contains either a `server.js` file or can invoke
'npm start' this command will try to start that server.

The optional `--env` parameter lets you specify an environment setting
such as `development` or `production`. The default is `development`.
The current setting is announced in the server startup banner:

    info: hello 0.1.0 (development) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:1111

The `--tds.port` parameter lets you specify a port other than
the registered TIBET Data Server port (which is port 1407).

If your server includes TDS features you can optionally add
command-line parameters to provide the various modules of the TDS
with config data. All values for the tds are supported. See the
output of `tibet config tds` for a list of current options.

## OPTIONS

  * `--env` :
    Specify an environment value to control the server. This value is used by
the system when loading values from `tds.json`, the server's config file. Common
values are `development` (the default), and `production`.

  * `--tds.port` :
    A commonly used `tibet config` option value which alters the port number the
server should start on.

## CONFIGURATION SETTINGS

    See `tibet start` for specific variables checked by the `server.js` file.

## ENVIRONMENT VARIABLES

    See `tibet start` for specific variables checked by the `server.js` file.

## EXAMPLES

### Start the server on a default port (1407)

    $ tibet tds start

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

    $ tibet tds start --tds.port 2222

    ...
    info: test1 0.1.0 (development) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:2222

### Start the server with a different environment

    $ tibet tds start --env testing

    ...
    info: hello 0.1.0 (testing) running on TIBET v5.0.0-dev.7 at http://127.0.0.1:1407

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-config(1)
  * tibet-start(1)
