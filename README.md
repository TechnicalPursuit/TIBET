# TIBET

TIBET is a <a href="https://github.com/TechnicalPursuit/TIBET/wiki/The-TIBET-Stack">seamless</a> front-end framework
blending the best features of today's modern JavaScript modules with a powerful
set of development tools.

Designed specifically for large-scale Enterprise and Government-class web
applications, TIBET is more like Smalltalk than Scheme, bringing tag-driven
development, advanced OO, and immersive development to JavaScript.

# Installation

If you don't have `Node.js` and `npm` installed start with the <a
href="#prereqs">Prerequisites</a>.

### Installing TIBET via npm

TIBET should be installed globally using `npm install` with the -g flag:<br/>
<pre>
    npm install -g tibet
</pre>

That's it. You should now have the latest stable release of TIBET
installed.

Follow the <a href="#nextsteps">Next Steps</a> to get started with your first
TIBET application.

### Installing TIBET via Git

If you prefer working from a git repository you can install TIBET via git.

##### Uninstall any npm-installed version of TIBET

If you have already installed TIBET via npm you need to first remove that
installation to avoid conflicts with your Git-based installation:

<pre>
    npm uninstall -g tibet
</pre>

##### Create a Fork

If you are going to install TIBET via Git we recommend that you first create a
fork of TIBET so you can manage updates in a stable, predictable fashion.

Follow these instructions to <a target="_blank" href="https://help.github.com/articles/fork-a-repo/">create
your own fork</a>.

##### Clone your Fork

<pre>
    git clone {{your_fork_repo_url}}
</pre>

##### Initialize your Fork

Once your fork has been cloned move into the new fork directory and install the
package dependencies:

<pre>
    cd {{your_fork_repo_directory}}
    npm install .
</pre>

##### Link TIBET via npm

With your fork initialized you'll need to link the repository via `npm link` so
that the `tibet` command will function properly:

<pre>
    npm link .
</pre>
<br/>
You should now be able to use the `tibet` command, which means you're ready to
start working on your first TIBET application.

<a name="nextsteps" href="#"></a>
# Next Steps

Once you have TIBET installed the `tibet` command gives you access to a wide
range of tools to help streamline your development workflow.

### Help

The `tibet help` command lists all the options for the `tibet` command:

<pre>
    $ tibet help

    Usage: tibet <command> <options>

    The tibet command can invoke TIBET built-ins, custom commands,
    tibet makefile.js targets, grunt targets, or gulp targets based
    on your project configuration and your specific customizations.

    <command> built-ins include:

        cache clone config context echo freeze help init lint
        make package quickstart reflect rollup start test thaw
        tsh version

    Project <commands> include:

        sample

    makefile.js targets include:

        build checkup clean rollup

    <options> always include:

        --help         display command help text
        --usage        display command usage summary
        --color        colorize the log output [true]
        --verbose      work with verbose output [false]
        --debug        turn on debugging output [false]
        --stack        display stack with error [false]

    Configure default parameters via 'tibet config'.

    tibet@v5.0.0-dev.7 /Users/ss/.nvm/v0.10.28/bin/tibet
</pre>

### Quickstart

The `tibet quickstart` command will output version-specific instructions on how
to clone, initialize, and start your first TIBET application.

<pre>
    $ tibet quickstart

    Welcome to TIBET! This quickstart content is intended to get you up and running
    with a minimum of overhead so we'll be working with a limited set of commands
    and using their default options. Once you're done, check out the development wiki
    at https://github.com/TechnicalPursuit/TIBET/wiki to dive deeper into TIBET.

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
    server we call the TIBET Development Server or TDS. By default the TDS will
    use port 1407 so assuming that port isn't busy on your system you can start
    the server using 'tibet start' without any parameters:

        $ tibet start
        Starting server at http://0.0.0.0:1407/index.html

    Congratulations! Your new TIBET project is running. Open the web address
    for your project in an HTML5 browser and you should see text directing you
    on how to take the next step in your TIBET journey.

    For more info visit http://github.com/TechnicalPursuit/TIBET/wiki.

</pre>

### Tutorials

The <a
href="https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Quickstart-Guide"
target="_blank">Quickstart Guide</a> is the best place to start your
journey with TIBET. You'll have your first TIBET application running in just a
few minutes with this guide.

For a detailed exploration of TIBET and its capabilities we recommend you work
through the <a
href="https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Essentials"
target="_blank">TIBET Essentials</a> tutorial. This walkthrough will take
longer but you'll get a complete picture of TIBET and what makes it special.


# Documentation

The <a href="https://github.com/TechnicalPursuit/TIBET/wiki"
target="_blank">TIBET Wiki</a> provides extensive tutorials, screencasts,
whitepapers, and other conceptual and design documentation for TIBET.

API documentation is generated from within TIBET itself via `tibet reflect` at
the command line and via `:reflect` from within the TIBET shell/Sherpa.

For information on TIBET-related services see <a href="http://www.technicalpursuit.com" target="_blank">www.technicalpursuit.com</a>.

<a name="prereqs" href="#"></a>
# Prerequisites

### Install Node.js

TIBET relies on Node.js and npm for command line tooling and integration of
today's best JavaScript modules. To install TIBET properly first make sure
you have Node.js <b>version 0.10.x</b>. _TIBET is not yet certified for Node
0.12_.

To install Node.js follow the instructions at <a href="http://nodejs.org"
   target="_blank">nodejs.org</a>.

### Update npm (optional)

If you already have a recent version of Node.js installed you should have a
valid version of `npm`. Unfortunately some older versions of `npm` suffer from
race condition errors. On \*nix variants update `npm` by running:<br/>
<pre>
    npm install -g npm@latest
</pre>

If you see errors from any npm-based operations mentioning `cb() never called!`
you'll want to perform the step above, or the appropriate step for your
operating system. See <a target="_blank"
href="https://github.com/npm/npm/wiki/Troubleshooting#try-the-latest-stable-version-of-npm">this npm troubleshooting topic</a> for more.

### Install PhantomJS (optional)

A few commands in the TIBET CLI rely on PhantomJS to operate properly (test,
tsh, reflect). <em>You can skip this step for now if you like</em>, those
commands will simply prompt you to install PhantomJS if you run them
without PhantomJS installed.

To install PhantomJS follow the instructions at <a
target="_blank" href="http://phantomjs.org">http://phantomjs.org</a>.

# Feedback

The best way to communicate an issue, feature request, or code-related
concern is to use the GitHub-based <a
href="https://github.com/TechnicalPursuit/TIBET/issues?milestone=1&page=1&state=open"
target="_blank">issues list</a> for TIBET.

If you have specific code you'd like us to consider we're always open to <a
href="http://help.github.com/articles/using-pull-requests" target="_blank">pull
requests</a>. Using pull requests is great way to keep discussion of new
features visible to the entire TIBET community.

Additional contact info is available at <a href="http://www.technicalpursuit.com"
target="_blank">www.technicalpursuit.com</a>.

