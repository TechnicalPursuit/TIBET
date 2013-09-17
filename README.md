# TIBET v5.0.0

TIBET 5.0 is a markup-centric, zero-server, zero-reload web platform
that makes web development more scalable, maintainable, and efficient.

### TIBET is markup-centric.
Tags are the focal point of development in TIBET. In TIBET, tags are
smart macros, macros you create, combine, and connect to create
applications of any scope and complexity. TIBET's tag library and our
TIBET Tag Store&trade; ecosystem give you access to a broad range of
reusable functionality in the form of modular, intelligent tag bundles.

### TIBET is zero-server.
TIBET is designed to run offline, sync when online, and limit reliance 
on networks, servers, or anything else the user may not have access to
when they need to run your application.

You can couple TIBET with any HTTP or WebDAV server...or zero server.
TIBET can boot directly from the file system, localStorage, or IndexedDB.
Or you can pair TIBET with Apache, CouchDB, Node.js, Rails3 or any other
server process you can access via HTTP or WebDAV.

### TIBET is zero-reload.
The entire TIBET platform, from our tag set to our IDE, is engineered to
eliminate reload cycles. With TIBET's tools the changes you make to your
JavaScript, HTML, and CSS are reflected instantly without the need to
reload. These changes can then be persisted or rolled back as needed.

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

Navigate to your new application directory and start the TIBET server by
entering the following commands (replace {path} with your application name):

    cd {path}     // or your platform's equivalent
    npm start

Open the application's boot page (index.html) in a modern web browser:

    http://127.0.0.1:3000/index.html

Congratulations. You're running a new TIBET application with the TIBET
development environment ready to support any changes you wish to make.

# Server Options

You can use TIBET with virtually any HTTP or WebDAV server. The built-in
server templates in TIBET's `dna` directory can be listed using:

    tibet list dna

Use the `tibet clone` command to clone any `dna` template to
create a new application based on that template.

# Help

You can get help on the `tibet` command and its options by entering:

    tibet help {command}


# Documentation

Product-specific documentation is hosted at <http://www.technicalpursuit.com>.

The GitHub-based [TIBET wiki](https://github.com/TechnicalPursuit/TIBET/wiki)
provides a forward-looking design blueprint and roadmap for TIBET's 
architecture, components, and construction standards.


# The Tag Store&trade;

TIBET tags are self-contained packages of web functionality you can create,
share, and leverage in the construction of your applications. The TIBET [Tag
Store&trade;](http://www.technicalpursuit.com/tibet/tagstore/) is our
clearinghouse for tags and other TIBET-related extensions. 


# Contacting Us

The best way to communicate an issue, feature request, or code-related concern
is to use the GitHub issues list. We monitor this list actively and try to
leverage it to keep all discussion regarding TIBET centralized on GitHub.

If you have specific code you'd like us to consider we're always open to [pull
requests](http://help.github.com/articles/using-pull-requests). Using pull
requests is great way to keep discussion of new features visible to the entire
TIBET community.

Additional contact info is available at <http://www.technicalpursuit.com>. 

