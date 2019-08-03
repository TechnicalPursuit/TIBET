{{topic}}({{section}}) -- prep and tag a release of TIBET
=============================================

## SYNOPSIS

tibet release

## DESCRIPTION

Performs the steps necessary to tag a release of the TIBET library.

The release process consists of several steps to sanity check the
current repository followed by a number of steps which work to build
a releasable version, tag it, commit it, and merge/push it to master.

Before proceeding this command will:

Verify the current branch is develop.
Verify the branch is not dirty. [--dirty (dev-only)]
Verify the branch is up-to-date. [--local]

IFF all the prior checks pass:

Run `tibet build_all` to build distro. [--no-build]
Run the version update template.
Update TIBET\'s package.json file.
Run `tibet checkup` to lint/test. [--no-check]

IFF all that runs and passes testing it:

Commits the changes which resulted.
Tags the develop branch with {tag}-develop.
Pushes those changes to origin/develop.

IFF that all worked successfully it:

Checks out the master branch.
Merges in the develop branch.
Commits the changes to master.
Tags the commit with the release tag.
Pushes the commit and related tag.

Once that is complete it:

Writes out latest.js content to be used in the technicalpursuit.com repo.
Writes out instructions on the final manual steps to do to publish TIBET.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES


## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

