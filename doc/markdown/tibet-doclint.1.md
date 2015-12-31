{{topic}}({{section}}) -- validates method comment content
=============================================

## SYNOPSIS

    tibet doclint [<filter>]

## DESCRIPTION

Runs the TSH `:doclint` command to validate method comment content.

The doclint command uses TIBET reflection to find all methods in your
application and check their comment text for conformance to JSDoc3 and
TIBET comment standards. This check can be a part of an overall quality
pass which includes running `tibet lint` and `tibet test` on your code.

If you provide an optional string parameter it will be used as a filter
for filenames. Using a string which begins and ends with / will cause the
pattern to be treated as a regular expression for testing purposes.

Note that because it uses method reflection, not file lists, to drive
the checks when this command outputs file counts they represent the
number of unique files containing matching methods, not a full list
of project files. This can be disconcerting at first if you are used
to listings which are built by file-driven tools.

