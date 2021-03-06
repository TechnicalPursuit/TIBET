<h1>TIBET&#8482; -- Drag, Drop, Deploy&#8482;</h1>


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

<blockquote>
<p>“…in awe of what you’ve done with JS.”</p>
<p>Brendan Eich, JavaScript’s creator.</p>
</blockquote>

<br/>

### We write JavaScript so you don't have to...

Angular; React; Vue; frameworks that force you to write code today, tomorrow, indefinitely. Your struggles to staff up, to stabilize your stack, to get support are, ironically, designed in.


#### TIBET is different. By design TIBET:

- lets you <a href="https://www.technicalpursuit.com/docs/why-tibet.html#staffing">eliminate coding over time</a>;
- is a <a href="https://www.technicalpursuit.com/docs/index.html">fully-integrated full-stack solution</a>;
- has <a href="https://www.technicalpursuit.com/docs/index.html#tools">unmatched CLI and IDE tooling</a>;
- is <a href="https://www.technicalpursuit.com/support.html">fully-supported</a> by one vendor...us.


<br/>

---

<img alt="Installation" src="./lib/media/disk.png" width="128px" height="128px"/>

# Installation

Before installing, check TIBET's <a href="#supported">supported platform chart</a> for your target platform(s).

See the <a href="https://github.com/TechnicalPursuit/TIBET/blob/master/INSTALL.md#installation">full installation instructions</a> if you want to run TIBET via Docker, or are interested in installing a development fork via Git.

TIBET is currently installed globally via `npm install -g`:<br/>

```
npm install -g tibet
```

<i>NOTE: Future versions will install the TIBET CLI globally and install the
library locally.</i>

Due to limitations in `npm`, complete the installation by running the following command to install TIBET's `devDependencies` in the newly-installed TIBET global package:

```bash
$(npm root -g)/tibet/bin/tibet_develop_init.bash
```

**Once your installation completes check out the <a href="https://www.technicalpursuit.com/docs/quickstart.html">TIBET Quickstart Guide</a>.**

<br/>

---

<img alt="Documentation" src="./lib/media/music.png" width="128px" height="128px"/>

# Documentation

#### Screencasts

Be sure to check out the <a href="https://www.youtube.com/channel/UCVs7Oj4NMJzlLDn32aqVUZg">TIBET JS Channel</a>...it has videos covering both the vision behind TIBET as well as specific features of the TIBET platform.


#### Concepts

The <a href="https://www.technicalpursuit.com">Technical Pursuit website</a> provides extensive tutorials,
whitepapers, and other conceptual and design documentation. We strongly
recommend you take a few minutes to scan it.

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

<a name="tutorials" href="#"></a>
#### Tutorials

- <a href="https://www.technicalpursuit.com/docs/quickstart.html">TIBET Quickstart</a> - Hello World! for TIBET developers.
- <a href="https://www.technicalpursuit.com/docs/essentials.html">TIBET Essentials</a> - Core features of the TIBET platform.

<a name="guidelines" href="#"></a>
#### Guidelines

- <a href="https://www.technicalpursuit.com/docs/faq.html">TIBET FAQ</a> - Answers to common
  TIBET-related questions.

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

<br/>

---

<img alt="Platforms" src="./lib/media/framing.png" width="128px" height="128px"/>

<a name="supported" href="#"></a>
# Supported Platforms

###### TIBET CLI / Server

The TIBET CLI, TIBET Server, TIBET Workflow System and other server-side
components are **fully-supported on MacOS and common Linux variants**.

Pre-built <a href="https://hub.docker.com/r/technicalpursuit/tibet">Docker images are available</a>.


###### TIBET Client

| Platform | TIBET Client | Live Patching |
|:---------|:-------------|:--------------|
| Google Chrome | Yes | Yes |
| Microsoft Edge (Chromium) | Yes | Yes |
| Mozilla Firefox | Yes | Yes |
| Apple Safari | Yes | Yes |
| Electron | Yes | Yes |
| Microsoft Edge (EdgeHTML) | No | No |
| Microsoft IE | No | No |

<br/>

---

<img alt="Open Source License" src="./lib/media/osi_logo.png" width="96px" height="96px"/>

# License

TIBET is Open Source under the OSI-approved <a
href="http://opensource.org/licenses/RPL-1.5">Reciprocal Public License
(RPL)</a>.

**You should read the license** but, in short, the RPL requires those who deploy
applications incorporating RPL'd code to reciprocate by open sourcing their code.

If you are unable to open source your TIBET-related code you have two options:

- You can <a href="http://www.technicalpursuit.com/license.xhtml">purchase a privacy waiver</a> which lets you keep your code private.
- You can <a href="http://www.technicalpursuit.com/contact.xhtml">contact TPI</a> for commercial, OEM, or reseller licensing options.

<br/>

---

<img alt="Feedback" src="./lib/media/solutions.png" width="128px" height="128px"/>

# Feedback

The best way to communicate an issue, feature request, or code-related
concern is to use the GitHub-based <a
href="https://github.com/TechnicalPursuit/TIBET/issues?milestone=1&page=1&state=open">issues list</a> for TIBET.

For other feedback options see the <a href="http://www.technicalpursuit.com/contact.xhtml">contact page</a> at <a href="http://www.technicalpursuit.com">www.technicalpursuit.com</a>.

<br/>

---

<img alt="The Pup" src="./lib/media/thepup.jpg" width="92px" height="138px"/>

<a href="https://www.technicalpursuit.com/contact.xhtml">Contact us</a> for more information, or to discuss how we can assist you.
