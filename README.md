# TIBET&#8482; <img src="https://travis-ci.com/TechnicalPursuit/TIBET.svg?token=xbHafM8Grd1ymLyJnp8P&branch=develop"/>

## The Sum Of The Parts, Not Some Of The Parts&#8482;


                                     ,`
                              __,~//`
           ,///,_       .~///////'`
               '//,   ///'`
                  '/_/'
                    `
            /////////////////     /////////////// ///
            `//'````````///      `//'```````````  '''
            ,/`          //      ,/'
           ,/___          /'    ,/_____
          ///////;;,_     //   ,/////////;,_
                   `'//,  '/            `'///,_
                       `'/,/                '//,
                          `/,                  `/,
                            '                   `/
                                                 '/
                                                  /
                                                  '

<br/>

#### **Building a desktop-class web application? We built TIBET for you.**

**TIBET is a seamlessly integrated web platform, not an à la carte mashup**, a solution offering **<a href="https://www.technicalpursuit.com/docs/platform.html#stack">the web's most complete client stack</a>** coupled with **<a href="https://www.technicalpursuit.com/docs/platform.html#tools">revolutionary tooling</a>**.

**TIBET is built for projects that need a <a href="https://www.technicalpursuit.com/docs/platform.html#client">turnkey client</a> OR <a href="https://www.technicalpursuit.com/docs/platform.html#server">full-stack web platform</a>** and the confidence that comes from using **a <a href="http://www.technicalpursuit.com/support.xhtml">fully supported</a> open source solution**.

**TIBET is <a href="https://www.technicalpursuit.com/docs/index.html">business focused</a>**, reducing <a href="https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f#.qdk718ex5">technical complexity</a> and costly dependence on jedis, gurus, ninjas, rockstars, superheros, wizards, warlords, and other forms of unobtainium.

#### **Reduced cost and reduced risk are TIBET's performance metrics.**

<br/>

---

<img alt="Installation" src="./lib/media/disk.png" width="128px" height="128px"/>

# Installation

**Check your OS, browser, and Node/npm versions against
TIBET's <a href="#prereqs">prerequisites</a>.**

#### Installing TIBET via `npm`

TIBET should be installed globally using `npm install -g`:<br/>

```bash
npm install -g tibet
```

Initial installation process can take several minutes depending on the speed of
your network connection and the particular version being installed. Be patient
:).

**Once your installation completes check out the <a href="https://www.technicalpursuit.com/docs/quickstart.html">TIBET Quickstart Guide</a>.**

#### Installing TIBET via `git`

If you prefer to install via `git` see the <a href="#gitinstall">TIBET Git
Installation</a> instructions.


<br/>

---

<img alt="Documentation" src="./lib/media/music.png" width="128px" height="128px"/>

# Documentation

#### Concepts

The <a href="https://www.technicalpursuit.com">Technical Pursuit website</a> provides extensive tutorials,
whitepapers, and other conceptual and design documentation. We strongly
recommend you take a few minutes to scan it.

<a name="tutorials" href="#"></a>
#### Tutorials

- <a href="https://www.technicalpursuit.com/docs/quickstart.html">TIBET Quickstart</a> - Hello World! for TIBET developers.
- <a href="https://www.technicalpursuit.com/docs/essentials.html">TIBET Essentials</a> - Core features of the TIBET platform.


<a name="guidelines" href="#"></a>
#### Guidelines

- <a href="https://www.technicalpursuit.com/docs/faq.html">TIBET FAQ</a> - Answers to common
  TIBET-related questions.
- <a href="https://www.technicalpursuit.com/docs/tibet4js.html">TIBET For JS Programmers</a> - JavaScript: the TIBET
parts&#8482;.
- <a href="https://www.technicalpursuit.com/docs/coding-standards.html">TIBET Coding Standards</a> - The coding standards used in TIBET.
- <a href="https://www.technicalpursuit.com/docs/troubleshooting.html">TIBET Troubleshooting</a> - Tips to keep you developing smoothly.

<a name="whitepapers" href="#"></a>
#### White Papers

- <a href="http://www.technicalpursuit.com/docs/TheZenOfTIBET.pdf"
  target="_blank">The Zen Of TIBET</a> - The problems, principles, and
priorities behind TIBET.
- <a
  href="http://www.technicalpursuit.com/docs/TheAxesOfTIBET.pdf"
target="_blank">The Axes Of TIBET</a> - Comparing web architecture and authoring models.
- <a
  href="http://www.technicalpursuit.com/docs/TheOriginsOfTIBET.pdf"
target="_blank">The Origins Of TIBET</a> - The evolution of TIBET from 1997 to
the present.

#### Command Line

Use `tibet help` for more information on the TIBET CLI and the available command
set for your version, or check out the full <a
href="https://www.technicalpursuit.com/docs/cli.html">TIBET CLI</a> documentation.

#### API Docs

##### `tibet reflect`

API documentation is generated for your TIBET version via `tibet reflect` at
the command line and via `:reflect` from within the <a
href="https://www.technicalpursuit.com/docs/tsh.html">TIBET Shell</a>. TIBET's `reflect` options can output type
lists, method lists, or individual object documentation.

##### `tibet apropos`

To explore TIBET functionality use the `tibet apropos` command
or `:apropos` from the <a
href="https://www.technicalpursuit.com/docs/tsh.html">TIBET Shell</a>. The `apropos` feature scans method names and
comments for matching terms, letting you search TIBET for functionality that
relates to a topic.

---

<img alt="Prerequisites" src="./lib/media/primitives.png" width="128px" height="128px"/>

<a name="prereqs" href="#"></a>
# Prerequisites

#### Supported platforms

###### TIBET CLI / Server

The TIBET CLI, TIBET Server, TIBET Workflow System and other server-side
components are **fully-supported on MacOS and common Linux variants**.

TIBET's command line and server components are **being ported to Windows**. In
the meantime we recommend using Docker or similar container technology if you
are a Windows-based developer. Pre-built Docker images will be available in an
upcoming release.


###### TIBET Client / Sherpa

| Platform | TIBET Client Runtime | TIBET Live Patching | TIBET Sherpa |
|:---------|:----------------------|:--------------------|:-------------|
| Google Chrome | Yes | Yes | Yes |
| Mozilla Firefox | Yes | Yes | Coming Soon |
| Apple Safari | Yes | Yes | Coming Soon |
| Electron | Yes | Coming Soon | Coming Soon |
| Microsoft Edge | Future | Future | Future |
| Microsoft IE | No | No | No |


#### Install Node.js

TIBET requires Node.js version 4+ (6+ is recommended).

We also recommend using `npm` version `3.x` (some TIBET dependencies have shown
installation glitches using version `5.x` of npm).

**We strongly recommend you use the Node Version Manager (`nvm`)** to manage
your Node.js installation. Using `nvm` lets you install multiple versions of
Node.js and switch between them with ease which is great for development and
helpful if you need to adjust the version running in production while
maintaining an easy rollback strategy.

To install Node.js via `nvm` see the instructions at <a
href="https://github.com/creationix/nvm">the nvm GitHub repo</a>.

To install Node.js without `nvm` follow the instructions at <a href="http://nodejs.org">nodejs.org</a>.

#### Update/Adjust npm

If you already have a recent version of Node.js installed you should have a
valid version of `npm`. Unfortunately some older versions (1.x) of `npm` suffer
from race condition errors and some newer (5.x) versions cause problems with
certain dependent modules like `phantomjs-prebuilt`. We suggest using npm `3.x`.

```
npm install -g npm@3
```

If you see errors from any npm-based operations mentioning `cb() never called!`
you'll want to perform the step above, or the appropriate step for your
operating system. See <a
href="https://github.com/npm/npm/wiki/Troubleshooting#try-the-latest-stable-version-of-npm">this npm troubleshooting topic</a> for more.

---

<img alt="Install via Git" src="./lib/media/git_logo@2x.png" width="128px" height="128px"/>

<a name="gitinstall" href="#"></a>
# Installing TIBET via Git

If you prefer working from a git repository you can install TIBET via git. This
approach can take a fair amount of time depending on connection and machine
speed since you'll need to download all of TIBET's dependencies and build them
locally.

##### First, uninstall any npm-installed version of TIBET

If you have already installed TIBET via npm you need to first remove that
installation to avoid conflicts with your Git-based installation:

```bash
npm uninstall -g tibet
```

##### Create a Fork

If you are going to install TIBET via Git we recommend that you first create a
fork of TIBET so you can manage updates in a stable, predictable fashion.

Follow these instructions to <a href="https://help.github.com/articles/fork-a-repo/">create
your own fork</a>.

##### Clone your Fork

```bash
git clone {{your_fork_repo_url}}
```

##### Initialize your Fork

Once your fork has been cloned move into the new fork directory and install the
package dependencies:

```bash
cd {{your_fork_repo_directory}}
npm install .
```

##### Link TIBET via npm

With your fork initialized you'll need to link the repository via `npm link` so
that the `tibet` command will function. From the top of your TIBET fork type:

```bash
npm link .
```
<br/>
You should now be able to use the `tibet` command which lets you run `tibet
build`.

##### Build TIBET Dependencies and Packages

When working with a `git`-based repository you'll need to rebuild TIBET packages
and dependencies, depending on your individual project launch configuration.

To build the full set of TIBET dependencies and launch packages use:

```
tibet build_all
```

NOTE: the above command can take _quite some time_ depending on your network
connection, machine performance, etc. since it's building a large set of
dependent modules in addition to TIBET itself.

With TIBET cloned, initialized, linked, and built you're ready to rock.

---

<img alt="Open Source License" src="./lib/media/osi_logo.png" width="96px" height="96px"/>

# License

TIBET is Open Source under the OSI-approved <a
href="http://opensource.org/licenses/RPL-1.5">Reciprocal Public License
(RPL)</a>.

You should read the license but, in short, the RPL requires those who deploy
applications incorporating RPL'd code to reciprocate by open sourcing their code.

If you are unable to open source your TIBET-related code you can purchase a
privacy waiver which allows you to keep your source code private while helping
fund further TIBET development. Read more about privacy waivers at <a
href="http://www.technicalpursuit.com/license.xhtml">https://www.technicalpursuit.com/license.xhtml</a>.

---

<img alt="Feedback" src="./lib/media/solutions.png" width="128px" height="128px"/>

# Feedback

The best way to communicate an issue, feature request, or code-related
concern is to use the GitHub-based <a
href="https://github.com/TechnicalPursuit/TIBET/issues?milestone=1&page=1&state=open">issues list</a> for TIBET.

Additional contact info is provided on the <a href="http://www.technicalpursuit.com/contact.xhtml">contact page</a> at <a
href="http://www.technicalpursuit.com">www.technicalpursuit.com</a>.

---

<img alt="The Pup" src="./lib/media/thepup.jpg" width="92px" height="138px"/>

<a href="https://www.technicalpursuit.com/contact.xhtml">Contact us</a> for more information, or to discuss how we can assist you.
