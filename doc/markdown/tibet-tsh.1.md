{{topic}}({{section}}) -- runs a TIBET Shell (TSH) expression
=============================================

## SYNOPSIS

    tibet tsh <command> [<phantomtsh_args>]

## DESCRIPTION

Runs the TIBET phantomtsh script runner to execute a TSH script.

The script to execute is presumed to be the first argument, quoted as
needed to ensure that it can be captured as a single string to pass to
the TIBET Shell. For example: tibet tsh ':echo "Hello World!"'.
You can also use the --script argument to provide the TSH script.

<phantomtsh\_args> refers to the various flags and paramters you can
provide to TIBET's phantomtsh.js script. To see phantomtsh.js help
use 'phantomjs ${TIBET\_HOME}/etc/phantom/phantomtsh.js --help
where ${TIBET\_HOME} refers to your TIBET installation directory.

