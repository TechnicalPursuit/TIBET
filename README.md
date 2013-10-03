# TIBET v5.0.0

    TIBET 5.0 is a markup-centric, mobile-ready, zero-reload web platform
    that makes web development more scalable, maintainable, and efficient.

### TIBET is markup-centric.
Tags are the focal point of development in TIBET. In TIBET, tags are
smart macros, macros you create, combine, and connect to create web
applications of any scope and complexity.

With TIBET a small group of JavaScript developers can support a much
larger team using markup, significantly scaling up development while 
improving maintainability.

### TIBET is mobile-ready.
TIBET is designed to run offline, sync online, and limit reliance 
on networks, servers, or anything else the user may not have access to
when they need your application, reducing downtime.

TIBET works with any HTTP-accessible server while providing a foundation
that lets you minimize load on your servers and networks, improving
scalability and efficiency.

### TIBET is zero-reload.
The entire TIBET platform is engineered to eliminate reload cycles. With
TIBET's tools the changes you make to your JavaScript, HTML, and CSS are
reflected instantly without delay.

TIBET's interactive command line, web shell, and IDE make you far more
efficient. Without the disruption of thousands of restart/reload cycles
per day your development process truly "flows".

# Installation

1. Install Node.js version 0.10 or greater from http://nodejs.org/
2. Install TIBET globally using the `npm` command:<br/>
<pre>
  npm install -g tibet
</pre>

# Quick Start

Once you've installed TIBET you use the `tibet` command to handle
application creation, configuration, testing, and deployment. 

To create a standalone TIBET application enter the following command,
replacing {path} with the name for your new application. Note that the
name must represent a valid directory name for the operating system you
are running on:

    tibet clone tibet {path}

Navigate to your new application directory and start the default TIBET server by
entering the following commands (again replacing {path} with your application
name):

    cd {path}
    npm start

Open your application's home page (index.html) in an HTML5 web browser:

    http://127.0.0.1:3000/index.html

Congratulations. You're running a new TIBET application with the TIBET
development environment ready to support any changes you wish to make.

# Documentation

The [TIBET wiki](https://github.com/TechnicalPursuit/TIBET/wiki)
provides forward-looking design blueprints, construction standards, and
a roadmap for TIBET's architecture and primary components.

Version-specific documentation is hosted at <http://www.technicalpursuit.com>.

# Servers

You can couple TIBET with any HTTP-accessible server...or with no server.

TIBET can boot directly from the file system, localStorage, or IndexedDB.
Or you can pair TIBET with Apache, CouchDB, Node.js, Rails3 or any other
server process you can access via HTTP.

Built-in server templates in TIBET's `dna` directory can be listed using:

    tibet list dna

Use the `tibet clone` command to clone any `dna` template to
create a new application based on that template.

# Help

You can get help on the `tibet` command and its options by entering:

    tibet help [command]

# Feedback

The best way to communicate an issue, feature request, or code-related concern
is to use the GitHub issues list. We monitor this list actively and try to
leverage it to keep all discussion regarding TIBET centralized on GitHub.

If you have specific code you'd like us to consider we're always open to [pull
requests](http://help.github.com/articles/using-pull-requests). Using pull
requests is great way to keep discussion of new features visible to the entire
TIBET community.

Additional contact info is available at <http://www.technicalpursuit.com>. 

