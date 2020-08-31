{{topic}}({{section}}) -- manage the TIBET Workflow System (TWS)
=============================================

## SYNOPSIS

`tibet tws [--confirm[=true|false]] [--no-confirm]
    <cancel|disable|enable|init|list|push|
        remove|restart|retry|submit|validate>
    [<flags>]`

## DESCRIPTION

Interacts with a CouchDB database specifically with respect to TIBET Workflow
Sytem (TWS) operation. The TWS leverages CouchDB for storage of both workflow
definitions and active workflow job execution. The `tibet tws` command allows
you to view, cancel, retry, and otherwise interact with the TWS engine and the
data which drives it.

Required CouchDB parameters such as server URL and database name are first
checked against `ENVIRONMENT VARIABLES`, then against a set of TIBET
configuration values rooted on `tws`.

If the `--confirm` flag is active (the default) parameter values that are
discovered are presented to you for confirmation/adjustment. Prompting can be
turned off via the `--no-confirm` flag or the `cli.tws.confirm` configuration
value.

    For example:

    $ export COUCH_DATABASE=dbtest_tasks
    $ export COUCH_USER={username}
    $ export COUCH_PASS={password}
    $ export COUCH_KEY={api_key}  # optional

    $ tibet tws list --flows
    mailtest::Team TIBET => ["smtp"] (31ee427eac51b94470bdfd14da00715e)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004abd)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004d32)
    mailtwo::Team TIBET => ["formatter","mailer"] (e52b072b50c597298c310ea9c80050b2)
    sample::Team TIBET => ["sample","smtp"] (e52b072b50c597298c310ea9c800af06)

## OPTIONS

  * `--confirm` :
    Should database URL and other parameters be confirmed when provided. Default
is true. Use `--no-confirm` to disable. If you want to disable confirmations in
general you can set the TIBET configuration value `cli.tws.confirm` to false.

## CONFIGURATION SETTINGS

  * `tws.scheme` :
    The CouchDB server scheme. Default is `http`.

  * `tws.host` :
    The CouchDB server hostname or IP address. Default is `127.0.0.1`.

  * `tws.port` :
    The CouchDB server port. Default is `5984`.

  * `tws.db_name`:
    The CouchDB database name to use. Defaults to the current project name +
    `_tasks`.

  * `tws.app_name`:
    The CouchDB application name to use. Defaults to `tws`.

## ENVIRONMENT VARIABLES

  * `COUCH_DATABASE` :
    The name of the CouchDB database to use for operations. Normally defaults to
the project name in a TIBET+CouchDB project with a `_tasks` suffix added.

  * `COUCH_APPNAME` :
    The name of the design document (application) in the database to use for
view lookup and application-related operations. Defaults to `tws`.

  * `COUCH_URL` :
    The URL of the CouchDB server. For example `http://127.0.0.1:5984`. This URL
can include username and password information but for more security it is
recommended you use `COUCH_USER`, `COUCH_PASS`, and `COUCH_KEY` variables
instead. If you do supply credentials be aware these values should be
URL-encoded (for example 'pass/word' must be provided as 'pass%2fword'). A
sample basic auth URL will resemble the following:
`http://admin:pass%2fword@127.0.0.1:5984`.

  * `COUCH_USER` :
    The username for the CouchDB server being accessed. Should be exported as a
URL-encoded value.

  * `COUCH_PASS` :
    The password for the CouchDB server account being accessed. Should be
exported as a URL-encoded value.

  * `COUCH_KEY` :
    The API key (if used) for the CouchDB server being accessed. Should be
exported as a URL-encoded value.

## EXAMPLES

### Initialize The Workflow Database

    Use the `tibet tws init` command:

    $ tibet tws init
    CouchDB url [http://127.0.0.1:5984] ?
    using base url 'http://127.0.0.1:5984'.
    Database name [testcouch_tasks] ?
    Application name [tws] ?
    confirming TWS database
    creating TWS database
    confirming TWS design doc
    inserting TWS design doc
    confirming TWS core views
    inserting TWS flows view
    inserting TWS jobs view
    inserting TWS jobs_active view
    inserting TWS jobs_cancelled view
    inserting TWS jobs_failed view
    inserting TWS jobs_complete view
    inserting TWS tasks view
    TWS initialized

### Enable / Disable The Workflow Engine

    $ tibet tws enable --engine
    Updating development configuration.
    TWS enabled in development.

    $ tibet tws disable --engine
    Updating development configuration.
    TWS disabled in development.

### Enable / Disable A Flow

    To enable or disable a flow you need to access the flow document's ID. You
    can get this information by listing the flows. Each flow's ID will be shown
    in parenthesis behind the flow.

    $ tibet tws list --flows
    mailtest::Team TIBET => ["smtp"] (31ee427eac51b94470bdfd14da00715e)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004abd)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004d32)
    mailtwo::Team TIBET => ["formatter","mailer"] (e52b072b50c597298c310ea9c80050b2)
    sample::Team TIBET => ["sample","smtp"] (e52b072b50c597298c310ea9c800af06)

    Use `tibet tws disable --flow` to disable a specific flow:

    $ tibet tws disable --flow e52b072b50c597298c310ea9c8004abd
    {
        "ok": true,
        "id": "e52b072b50c597298c310ea9c8004abd",
        "rev": "2-9a9c8c21cfbebe25c1a55d48396f1599"
    }

    $ tibet tws enable --flow e52b072b50c597298c310ea9c8004abd
    {
        "ok": true,
        "id": "e52b072b50c597298c310ea9c8004abd",
        "rev": "3-502d6a76bf49442e8fe822b95c39a178"
    }

### List Flows/Jobs/Tasks/Views

    $ tibet tws list --flows
    mailtest::Team TIBET => ["smtp"] (31ee427eac51b94470bdfd14da00715e)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004abd)
    mailtest::Team TIBET => ["mailer"] (e52b072b50c597298c310ea9c8004d32)
    mailtwo::Team TIBET => ["formatter","mailer"] (e52b072b50c597298c310ea9c80050b2)
    sample::Team TIBET => ["sample","smtp"] (e52b072b50c597298c310ea9c800af06)

    $ tibet tws list --jobs
    sample::Team TIBET => $$ready (e52b072b50c597298c310ea9c800ef49)
    sample::Team TIBET => $$ready (e52b072b50c597298c310ea9c8011ce9)
    sample::Team TIBET => $$ready (e52b072b50c597298c310ea9c8015de3)

    $ tibet tws list --tasks
    s3 => plugin s3-upload (e52b072b50c597298c310ea9c8010560)
    sample => plugin sample (e52b072b50c597298c310ea9c8010885)
    sample => plugin sample (e52b072b50c597298c310ea9c801059a)
    sendmail => plugin mail-sendmail (e52b072b50c597298c310ea9c8007e07)
    smtp => plugin mail-smtp (e52b072b50c597298c310ea9c8005852)

    $ tibet tws list --views
    flows
    jobs
    jobs_complete
    tasks
    jobs_cancelled
    jobs_failed
    jobs_active
    everything
    sample

### Push Workflow Design Document

    $ tibet tws push --design
    Design document is already up to date.

### Push Core Tasks, Flows, and Views

    Pushing the "map" uploads the latest version of all the defined tasks and
    flows for the current tws project. Note that any files with a leading
    underscore are considered private and are ignored by this command.

    $ tibet tws push --map
    ignoring: /Users/ss/temporary/dbtest/couch/tws/tasks/_sample.json
    uploading: /Users/ss/temporary/dbtest/couch/tws/tasks/s3.json
    uploading: /Users/ss/temporary/dbtest/couch/tws/tasks/sendmail.json
    uploading: /Users/ss/temporary/dbtest/couch/tws/tasks/smtp.json
    ignoring: /Users/ss/temporary/dbtest/couch/tws/flows/_sample.json
    uploading: /Users/ss/temporary/dbtest/couch/tws/flows/mailtest.json
    /Users/ss/temporary/dbtest/couch/tws/tasks/sendmail.json =>
    {
        "ok": true,
        "id": "30692839999368e55ac62c52b6000a27",
        "rev": "1-4e84e92a45eb82a91b9a01f1d32390de"
    }
    /Users/ss/temporary/dbtest/couch/tws/tasks/s3.json =>
    {
        "ok": true,
        "id": "30692839999368e55ac62c52b6000687",
        "rev": "1-7cca9c410498195b08162b357ab36fbf"
    }
    /Users/ss/temporary/dbtest/couch/tws/flows/mailtest.json =>
    {
        "ok": true,
        "id": "30692839999368e55ac62c52b6000ca2",
        "rev": "1-5ca1b0d30afe66c43cef856366d6eb93"
    }
    /Users/ss/temporary/dbtest/couch/tws/tasks/smtp.json =>
    {
        "ok": true,
        "id": "30692839999368e55ac62c52b600144f",
        "rev": "1-ce25bc7f6540153d4eb6f51220fa08ee"
    }

### Push Flows/Jobs/Tasks/Views

    Use the `tibet tws push` command and provide either a specific document path
    or one of the flags intended to push a particular class of document:

    $ tibet tws push [<path>|--design|--flows|--map|--tasks|--views]

### Cancel a Job

    Cancelling a job requires a job id. You can view these in the output from
    the `tibet tws list --jobs` command or you can use `tibet tws view` to run a
    view to help limit the output so you find the job ID you need.

    $ tibet tws cancel e52b072b50c597298c310ea9c8011ce9
    {
        "ok": true,
        "id": "e52b072b50c597298c310ea9c8011ce9",
        "rev": "3-2c46abf2b79be87f7be0fbb7056a5e92"
    }

### Submit a Job

    The `tibet tws submit` command lets you specify a job document from the
    ~/couch/tws/jobs directory for your project. Any entries in the JSON
    document delimited by `[[` and `]]` will be replaced after you are prompted
    for their values.

    For example, if you submit the `sample.json` job document below:

    {
        "type": "job",
        "flow": "sample",
        "owner": "Team TIBET",
        "params": {
            "smtp": {
                "to": "[[to_address]]",
                "subject": "[[subject]]"
            }
        }
    }

    You will be prompted for `to_address` and `subject` since this job will
    trigger an email workflow.

    $ tibet tws submit sample
    [[to_address]] ? ss@dbsa.com
    [[subject]] ? testing
    {
        "ok": true,
        "id": "30692839999368e55ac62c52b6001d60",
        "rev": "1-64cbec7b86393bcf02ef81db283f721f"
    }

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING

During any operation if you receive a message including output to the effect
that `You are not a server admin.` either export the the proper environment
variables or provide your credentials in your `CouchDB url` prompt response.

## SEE ALSO

  * tibet-couch(1)
