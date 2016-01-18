{{topic}}({{section}}) -- validates method comment content
=============================================

## SYNOPSIS

    tibet doclint [<target>] [--filter <filter>] [--context <app|lib|all>]

## DESCRIPTION

Runs the TSH `:doclint` command to validate method comment content.

The doclint command uses TIBET reflection to find all methods in your
application and check their comment text for conformance to JSDoc3 and
TIBET comment standards. This check can be a part of an overall quality
pass which includes running `tibet lint` and `tibet test` on your code.

If you provide an optional string parameter it will be used as a target
ID which must resolve via TP.bySystemId. Only methods owned by that target will
be checked.

If you provide a --filter the method names themselves will be filtered to match
only the pattern or string provided.

The context (app, lib, or all) is generally defaulted based on any target data
given. For example, using a target of `APP.*` will cause an `app` context while
using a target of `TP.*` will default to a lib context. To use the `all` context
you must specify it explicitly.

Note that because it uses method reflection, not file lists, to drive
the checks when this command outputs file counts they represent the
number of unique files containing matching methods, not a full list
of project files. This can be disconcerting at first if you are used
to listings which are built by file-driven tools.

