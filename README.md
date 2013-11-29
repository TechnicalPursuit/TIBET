# TIBET v5.0.0

    TIBET 5.0 is a markup-centric, mobile-ready, zero-reload web platform
    that makes web development more scalable, maintainable, and efficient.

### TIBET is markup-centric.
Tags are the focal point of development in TIBET. In TIBET, tags are
smart macros, macros you create, combine, and connect to create web
applications of any scope and complexity.

With TIBET a small team using JavaScript can support a much
larger team using <a href="https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Semantic-Tags" target="_blank">semantic markup</a>, significantly scaling your development while 
improving maintainability.

### TIBET is mobile-ready.
TIBET is designed to run offline, sync online, and limit reliance 
on networks, servers, or anything else your users may not have access to
when they need your application.

TIBET works <a
href="https://github.com/TechnicalPursuit/TIBET/wiki/The-TIBET-Loader#wiki-zero"
target="_blank">with or without a server</a>, providing you with a foundation
that lets you minimize load on your servers and networks, improving scalability
and efficiency.

### TIBET is zero-reload.
The TIBET platform is engineered to eliminate reload cycles. With TIBET's <a
href="https://github.com/TechnicalPursuit/TIBET/wiki/Home#wiki-tools"
target="_blank">interactive tools</a> the changes you make to your JavaScript, HTML,
and CSS are reflected instantly.

Without the disruption of hundreds of reload cycles per day your
development process flows, creating the opportunity for unprecedented
creativity and productivity.

# Installation

1. Install Node.js version 0.10 or greater from <a href="http://nodejs.org"
   target="_blank">nodejs.org</a>.
2. Install TIBET globally using the `npm` command installed via node:<br/>
<pre>
  npm install -g tibet
</pre>

TIBET will self-test to confirm a successful installation.

# Quick Start

1. Create an application using `tibet clone tibet` replacing {name} with your
   app name:
<pre>
  tibet clone tibet {name}
</pre>

2. Navigate to your application directory and start the server via
`npm start`:
<pre>
  cd {name}
  npm start
</pre>
3. Open your new application's home page (<a
   href="http://127.0.0.1:3000/index.html" target="_blank">index.html</a>) in an
HTML5 web browser:
<pre>
    open index.html
</pre>

Congratulations! You're running a new TIBET application with the <a
href="https://github.com/TechnicalPursuit/TIBET/wiki/The-TIBET-Immersive-Development-Environment-(IDE)"
target="_blank">TIBET IDE</a> installed.

# Documentation

The <a href="https://github.com/TechnicalPursuit/TIBET/wiki" target="_blank">TIBET Wiki</a>
provides forward-looking design blueprints, construction standards, and
a roadmap for TIBET's development. Look there for conceptual, design, 
and developer documentation as well as introductory white papers.

Version-specific API and tool documentation is hosted at <a href="http://technicalpursuit.com" target="_blank">technicalpursuit.com</a>

# App Templates

You can combine TIBET with any HTTP-accessible server, or with no (aka 'zero') server.

##### Offline / Standalone

You can boot TIBET from the file system, localStorage, or IndexedDB.
Creating standalone tablet or Chromebook-based applications? We've got
templates for that.

##### Online / Web

Have a current web server? You can pair TIBET with Apache, Node.js,
Rails3 or whatever HTTP-accessible web server you might have. Or you can use the
<a href="https://github.com/TechnicalPursuit/TIBET/wiki/The-TIBET-Server"
target="_blank">TIBET Server</a>.

##### Direct-to-Database (D2D)

Want to shake things up? Try pairing TIBET with an HTTP-accessible
database in what we call a Direct-to-Database (D2D) design. CouchDB
template provided :).

##### DNA / Custom

The full list of built-in application templates can be listed using:

    tibet list dna

Use the `tibet clone` command to clone any available template to
create your application. Add your own content to the dna directory to
support custom templates.

# Help

You can get help on the `tibet` command and its options by entering:

    tibet help [command]

# Feedback

The best way to communicate an issue, feature request, or code-related
concern is to use the GitHub-based <a
href="https://github.com/TechnicalPursuit/TIBET/issues?milestone=1&page=1&state=open"
target="_blank">issues list</a> for TIBET.

If you have specific code you'd like us to consider we're always open to <a
href="http://help.github.com/articles/using-pull-requests" target="_blank">pull
requests</a>. Using pull requests is great way to keep discussion of new
features visible to the entire TIBET community.

Additional contact info is available at <a href="http://technicalpursuit.com"
target="_blank">technicalpursuit.com</a>.

