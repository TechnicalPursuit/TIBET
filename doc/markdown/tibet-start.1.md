{{topic}}({{section}}) -- starts the project's TIBET Data Server
=============================================

## SYNOPSIS

tibet start [<options>] [--env <name>]

## DESCRIPTION

Performs project-specific start operations. For a TDS-based project this command
will attempt to start the TDS. For an Electron project this command will launch
your application's root page in Electron. For other project types this command
will typically call the current operating system's `open` command with your
project's root file.

## OPTIONS

  * `--env` :
    Specify an environment value to control the server. This value is used by
the system when loading values from `tds.json`, the server's config file. Common
values are `development` (the default), and `production`.

  * `--tds.port` :
    A commonly used `tibet config` option value which alters the port number the
server should start on.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

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

  * tibet-config(1)
