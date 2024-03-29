{{topic}}({{section}}) -- outputs first steps for new TIBET users
=============================================

## SYNOPSIS

`tibet quickstart`

## DESCRIPTION

Outputs quick getting started information for new TIBET users.

## OPTIONS

No command options or flags are checked by this command.

## CONFIGURATION SETTINGS

No TIBET configuration variables are utilized by this command.

## ENVIRONMENT VARIABLES

No process environment variables are required by this command.

## EXAMPLES

### Run it :)

    Welcome to TIBET! This quickstart content is intended to get you up and
    running with a minimum of overhead so we'll be working with a limited set of
    commands and using their default options. Once you're done, check out the
    documentation at https://www.technicalpursuit.com to dive deeper into TIBET.

    CREATE A NEW PROJECT

    The 'tibet clone' command is your first step in creating a TIBET project.

    Before using clone navigate to a directory to hold your new project content
    and select a name for your new project. The name will be used as a directory
    name so it should be a valid directory name on your platform.

    Type 'tibet clone {appname}', replacing {appname} with your project name:

        $ tibet clone test
        TIBET dna 'default' cloned to test as app 'test'.

    INITIALIZE THE PROJECT

    With your new project in place you need to initialize it to install any code
    dependencies specific to the template you cloned (we used the default here).
    Navigate to your project and then type 'tibet init' to initialize it:

        $ cd test
        $ tibet init
        Initializing new default project...
        installing project dependencies via `npm install`.
        Project initialized successfully.

    START THE DEMO SERVER

    The 'default' template used by clone includes a simple Node.js-based HTTP
    server we call the TIBET Data Server or TDS. By default the TDS will use
    port 1407 so assuming that port isn't busy on your system you can start the
    server using 'tibet start' without any parameters:

        $ tibet start
        Starting server at http://127.0.0.1:1407/index.html

    Congratulations! Your new TIBET project is running. Open the web address
    for your project in an HTML5 browser and you should see text directing you
    on how to take the next step in your TIBET journey.

    For more info visit https://www.technicalpursuit.com.

## TIBET SHELL

This command has no client-side TSH peer command.

## TROUBLESHOOTING


## SEE ALSO

