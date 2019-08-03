{{topic}}({{section}}) -- encrypt a string using the TDS.encrypt approach
=============================================

## SYNOPSIS

tibet encrypt <string>

## DESCRIPTION

Encrypts a string using the same approach used by the TDS. This command is
provided as a convenience allowing you to set a TDS_CRYPTO_KEY environment value
and then encrypt passwords or API keys prior to storing them.

The TIBET Workflow System (TWS) tasks expect passwords/keys to be provided in
encrypted form as output by this command. This allows you to store task-specific
passwords or API keys as part of your task definitions or parameters.

Note that you can also set TDS_CRYPTO_SALT to alter the salt value used for the
encryption and decryption processes.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

    $ export TDS_CRYPTO_KEY='TOPsecretKEY'
    $ tibet encrypt 'myrestserviceapikey'
    f92d28cf96fb590cf92a206a9b4c3af4

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-decrypt(1)
