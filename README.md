# TIBET

                                          ,`
                                    __,~//`
           ,///,_            .~////////'`
          '///////,       //////''`
                 '//,   ///'`
                    '/_/'
                      `
            ////////////////////     ///////////////////  ////
            `//'````````````///      `//'```````````````  '''
             /`              //       /'
            /                //      '/
           ,/____             /'    ,/_____
          /////////;;,,_      //   ,//////////;,_
                      `'/,_   '/              `'///,_
                         `'/,_ /                   '//,
                            '/,/,                    '/_
                              `/,                     `/,
                                '                      `/
                                                       '/
                                                        /


#### The Sum Of The Parts, Not Some Of The Parts&#8482;

We like to say TIBET is The Sum Of The Parts, Not Some Of The Parts&#8482;,
our way of saying TIBET is a seamlessly integrated framework; one focused on
**solving both the technical and business problems** associated with
large-scale web development.

TIBET's <a href="https://github.com/TechnicalPursuit/TIBET/wiki#stack">client stack</a>
combines best-of-breed technology with unmatched standards support in a
comprehensive, vendor-supported stack that reduces technical risk.

TIBET's <a href="https://github.com/TechnicalPursuit/TIBET/wiki#tools">authoring tools</a>
let your team focus on standards-compliant markup, not JavaScript coding,
reducing the need for costly gurus, ninjas, and rock stars.

<a href="http://www.technicalpursuit.com/html/support.xhtml">Commercial support</a>,
open source <a href="http://www.technicalpursuit.com/html/license.xhtml">privacy
waivers</a>, and
<a href="http://www.technicalpursuit.com/html/solutions.xhtml">development services</a> are available
from Technical Pursuit Inc., the company behind TIBET.

#### See TIBET in action on the <a target="_blank" href="https://www.youtube.com/channel/UC2GrMtU0Mt9z4zxkbKVbF6A">TIBET JavaScript Channel</a>.

---

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
that the `tibet` command will function. From the top of your TIBET fork type:

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
    server we call the TIBET Data Server or TDS. By default the TDS will use
    port 1407 so assuming that port isn't busy on your system you can start
    the server using 'tibet start' without any parameters:

        $ tibet start
        Starting server at http://127.0.0.1:1407/index.html

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

Additional contact info is available at <a href="http://www.technicalpursuit.com"
target="_blank">www.technicalpursuit.com</a>.

# License

TIBET is Open Source under the OSI-approved <a target="_blank" href="http://opensource.org/licenses/RPL-1.5">Reciprocal Public License (RPL)</a>.

You should read the license but, in short, the RPL requires those who deploy
applications incorporating RPL'd code to reciprocate by open sourcing their code.

Technical Pursuit Inc., the company behind TIBET, offers privacy waivers which
allow you to keep your source code private while helping to fund further TIBET
development. Read more about privacy waivers at <a target="_blank"
href="http://www.technicalpursuit.com/html/license.xhtml">http://www.technicalpursuit.com/html/license.xhtml</a>.

##### Third Party Libraries

Like virtually all JavaScript frameworks, TIBET uses a number of npm
modules. The list changes per release. To see the specific licenses for a
particular TIBET release's third-party components see the content of your TIBET
release's node\_modules directory.

