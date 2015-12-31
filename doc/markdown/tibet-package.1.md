{{topic}}({{section}}) -- list package assets either as asset paths or nodes
=============================================

## SYNOPSIS

    tibet package [--package <package>] [--config <cfg>] [--all]
        [--missing] [--include <asset names>] [--exclude <asset names>]
        [--scripts] [--styles] --[images] [--phase <phase>] [--nodes]

## DESCRIPTION

Outputs a list of package assets either as asset nodes or asset paths.

This command is a useful way to view the files which a `tibet rollup` or
`tibet lint` command will process. The best way to get a sense of this
command is to run it with various options, of which there are many:

--package    the file path to the package to process.
--config     the name of an individual config to process.
--all        process all config tags in the package recursively.
--missing    output a list of missing assets of all types.

--include    a space-separated list of asset tags to include.
--exclude    a space-separated list of asset tags to include.

--nodes      output asset nodes rather than asset paths.
--phase      boot phase subset to process <all | one | two | app | lib>.

--images     include all image assets.
--scripts    include all JavaScript source-containing assets.
--styles     include all CSS containing assets.

## SEE ALSO

  * lint(1)
  * rollup(1)

