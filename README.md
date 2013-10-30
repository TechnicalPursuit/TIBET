# TIBET v5.0.0

    TIBET 5.0 is a markup-centric, mobile-ready, zero-reload web platform
    that makes web development more scalable, maintainable, and efficient.

### TIBET is markup-centric.
Tags are the focal point of development in TIBET. In TIBET, tags are
smart macros, macros you create, combine, and connect to create web
applications of any scope and complexity.

With TIBET a small team of JavaScript developers can support a much
larger team using markup, significantly scaling your development while 
improving maintainability.

### TIBET is mobile-ready.
TIBET is designed to run offline, sync online, and limit reliance 
on networks, servers, or anything else your users may not have access to
when they need your application, reducing downtime.

TIBET works with or without a server, providing you with a foundation
that lets you minimize load on your servers and networks, improving
scalability and efficiency.

### TIBET is zero-reload.
The entire TIBET platform is engineered to eliminate reload cycles. With
TIBET's tools the changes you make to your JavaScript, HTML, and CSS are
reflected instantly without delay.

Without the disruption of thousands of reload cycles per day your
development process flows, creating the opportunity for unprecedented
creativity and productivity.

# Installation

1. Install Node.js version 0.10 or greater from http://nodejs.org/
2. Install TIBET globally using the `npm` command installed via node:<br/>
<pre>
  npm install -g tibet
</pre>

TIBET will self-test to confirm a successful installation.

# Quick Start

To create a standalone TIBET application enter the following command,
replacing {path} with the name of your new application:

    tibet clone tibet {path}

Navigate to your application directory and start the default server by
entering the following commands (replacing {path} as needed):

    cd {path}
    npm start

Open your new application's home page (index.html) in an HTML5 web browser:

    http://127.0.0.1:3000/index.html

Congratulations! You're running a new TIBET application with the TIBET
development environment ready to support any changes you wish to make.

# Documentation

The [TIBET wiki](https://github.com/TechnicalPursuit/TIBET/wiki)
provides forward-looking design blueprints, construction standards, and
a roadmap for TIBET's development. Look there for context and conceptual
documentation.

Version-specific API and tool documentation is hosted at
<http://www.technicalpursuit.com>.

# App Templates

You can combine TIBET with any HTTP-accessible server. Or with no server.

##### Offline / Standalone

You can boot TIBET from the file system, localStorage, or IndexedDB.
Creating standalone tablet or Chromebook-based applications? We've got
templates for that.

##### Online / Web

Have a current web server? You can pair TIBET with Apache, Node.js,
Rails3 or whatever HTTP-accessible web server you might have. Or you can
use the TIBET Server.

##### Direct-to-Database (D2D)

Want to shake things up? Try pairing TIBET with an HTTP-accessible
database in what we call a Direct-to-Database (D2D) design. CouchDB
template provided :).

The full list of built-in application templates can be listed using:

    tibet list dna

Use the `tibet clone` command to clone any available template to
create your application.

# Help

You can get help on the `tibet` command and its options by entering:

    tibet help [command]

# Feedback

The best way to communicate an issue, feature request, or code-related
concern is to use the GitHub [issues
list](https://github.com/TechnicalPursuit/TIBET/issues?milestone=1&page=1&state=open)
for TIBET.

If you have specific code you'd like us to consider we're always open to [pull
requests](http://help.github.com/articles/using-pull-requests). Using pull
requests is great way to keep discussion of new features visible to the entire
TIBET community.

Additional contact info is available at <http://www.technicalpursuit.com>. 

