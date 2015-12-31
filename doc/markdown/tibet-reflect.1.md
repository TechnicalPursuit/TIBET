{{topic}}({{section}}) -- reflects on TIBET objects and methods
=============================================

## SYNOPSIS

    tibet reflect [target] [--interface <interface>]
        [--filter <filter>] [--types] [--methods] [--owners] [--slots]

## DESCRIPTION

Runs the TSH :reflect command to show object or system reflection data.

You can list all of TIBET's types via `tibet reflect --types` or list all
methods via `tibet reflect --methods`. You can combine these flags along
with --slots to create collections of results. Without a target object this
approach lets you view a wide range of content from the TIBET system.

The [target] parameter can be any object reference TIBET can resolve
using TIBET's getObjectById() function. That means any namespace, type,
method, or publicly registed object such as window or a TIBET URI.

For objects which support it the --interface option lets you restrict
the results to a specific interface of the object. The values here must
be found in the TP.SLOT\_FILTERS object as used by TP.interface(). Some
interesting options are `known`, `public`, and `unique`.

Note that not all flags will work for every target object type. Namespace
objects don't support --owners for example. When a flag is ignored it is
not typically reported since working combinations are so target-dependant.
The best thing to do is experiment a little and see what reflect finds.

The --filter option allows you to refine your result data by checking the
keys returned against either a regular expression or string. The filter value
is always used as a RegExp if one can be created from the string. Full RegExp
syntax is possible to the extent your shell will allow it. For example, using
`--filter '/example/i'` will filter for example in a case-insensitive fashion.

