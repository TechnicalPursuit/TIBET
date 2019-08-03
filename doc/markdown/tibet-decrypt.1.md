{{topic}}({{section}}) -- decrypt a string
=============================================

## SYNOPSIS

tibet decrypt <string>

## DESCRIPTION

Decrypts a string using the same approach used by various TIBET server-side
components. This command is provided as a convenience allowing you to
decrypt API and service configuration values as needed to verify them.

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
    $ tibet decrypt b460c7357dde9fdb50767791307cc4cb:98bb6a27b27cec1630467accf25d62a8d60348
    myrestserviceapikey

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

  * tibet-encrypt(1)
