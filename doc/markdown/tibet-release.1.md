{{topic}}({{section}}) -- prep and tag a release
=============================================

## SYNOPSIS

`tibet release [--dirty] [--dry-run] [--force] [--local]`

## DESCRIPTION

Performs the steps necessary to tag a release-ready git codebase.

The release process consists of several steps to sanity check the
current repository followed by a number of steps which work to build
a releasable version, tag it, commit it, and merge/push it to master.

Before proceeding this command will:

Verify the current branch is the configured 'source' branch.
Verify the source branch is not dirty. [override with --dirty]
Verify the source branch is up-to-date. [override with --local]

IFF all the prior checks pass:

Run `tibet lint --clean` to lint the codebase.
Run `tibet test` to run the full test harness.

IFF all that runs and passes testing it:

Tags the source branch with {tag}-{branchname}.
Pushes the new tag name to origin/{branchname}.

IFF that all worked successfully it:

Checks out the target branch.
Verifies the target branch is current.
Merges in the source branch.
Commits the changes to the target.
Tags the commit with the release tag.
Pushes the commit and related tag.
Checks out the source branch.


## OPTIONS

  * `--dirty` :
    Allow the command to work even if the current source branch is dirty.

  * `--local` :
    Allow the command to work even if the local branch isn't fully synced with
its remote counterpart.

  * `--dry-run` :
    Output the checks that would be done, but don't actually commit or push any
changes.

  * `--force` :
    Force operation even when dirty or out of sync etc.


## CONFIGURATION SETTINGS

  * `cli.release.source` :
    The source branch name to use. Default is 'develop'.

  * `cli.release.target` :
    The target branch name to use. Default is 'master'.

  * `cli.release.remote` :
    The remote name to use. Default is 'origin'.

  * `cli.release.suffixes` :
    The list of default suffixes: [beta, dev, final, hotfix, pre, rc].


## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Run a typical release

    $ tibet release
    Ready to check 0.1.0+g04e020369c.0.1606261039549? Enter 'yes' to continue: yes

    checked 13 of 28 total files
    (11 filtered, 0 unchanged)
    0 errors, 0 warnings. Clean!
    Preparing to:
    git fetch --tags
    git commit -am 'release 0.1.0-develop'
    git tag -a '0.1.0-develop' -m 'release 0.1.0-develop'
    git push origin develop --tags
    Process changes to develop as 0.1.0-develop? Enter 'yes' after inspection: yes
    executing git fetch --tags
    executing git commit -am 'release 0.1.0-develop'
    executing git tag -a '0.1.0-develop' -m 'release 0.1.0-develop'
    executing git push origin develop --tags
    Preparing to:
    git fetch --tags
    git checkout master
    git pull --ff
    git merge develop
    git tag -a '0.1.0' -m 'Release 0.1.0'
    git push origin master --tags
    git checkout develop
    Process changes to master as 0.1.0? Enter 'yes' after inspection: yes
    executing git fetch --tags
    executing git checkout master
    Your branch is up to date with 'origin/master'.
    executing git pull --ff
    Already up to date.
    executing git merge develop
    Updating 3d39c02..76a0cc6
    Fast-forward
     package.json                             |  2 +-
     public/TIBET-INF/cfg/getlama.xml         |  2 +-
     public/TIBET-INF/cfg/main.xml            |  2 +-
     public/src/templates/version.js          | 33 ++++++++++++++++----------------
     public/src/templates/version_template.js | 33 ++++++++++++++++----------------
     5 files changed, 37 insertions(+), 35 deletions(-)
    executing git tag -a '0.1.0' -m 'Release 0.1.0'
    executing git push origin master --tags
    executing git checkout develop
    Your branch is up to date with 'origin/develop'.
    Release complete.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

