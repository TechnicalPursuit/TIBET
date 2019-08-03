{{topic}}({{section}}) -- encrypt a string
=============================================

## SYNOPSIS

tibet encrypt <string>

## DESCRIPTION

Encrypts a string using the same approach used by other TIBET components.

This command is provided as a convenience allowing you to encrypt passwords or
API keys prior to storing them.

The TIBET Workflow System (TWS) tasks expect passwords/keys to be provided in
encrypted form as output by this command. This allows you to store task-specific
passwords or API keys as part of your task definitions or parameters.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

  * `tibet.crypto.cipher` :
    The encryption/decryption mechanism to use. Defaults to `aes-256-ctr`.

  * `tibet.crypto.keylen` :
    The encryption/decryption key length. Defaults to 32.

  * `tibet.crypto.saltlen` :
    The encryption/decryption salt length. Defaults to 16.

## ENVIRONMENT VARIABLES

  * `TIBET_CRYPTO_CIPHER` :
    The encryption/decryption mechanism to use.

  * `TIBET_CRYPTO_KEY` :
    The secret key used to drive the encryption/decryption.

  * `TIBET_CRYPTO_KEYLEN` :
    The encryption/decryption key length.

  * `TIBET_CRYPTO_SALTLEN` :
    The encryption/decryption salt length.

## EXAMPLES

    $ export TIBET_CRYPTO_KEY='TOPsecretKEY'
    $ tibet encrypt 'myrestserviceapikey'
    b460c7357dde9fdb50767791307cc4cb:98bb6a27b27cec1630467accf25d62a8d60348

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-decrypt(1)
