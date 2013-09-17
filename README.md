# TIBET v5.0.0

TIBET 5.0 is a markup-centric, zero-reload, web platform built to make
web application development more scalable, maintainable, and efficient.

### TIBET 5.0 is markup-centric.
Tags are the central organizing principle for development in TIBET. In
TIBET, tags are smart macros, macros you create, combine, and connect to
create applications of any scope and complexity. TIBET's tag library and
our TIBET Tag Store&trade; ecosystem give you access to a broad range of
reusable functionality in the form of modular, intelligent tag bundles.

### TIBET 5.0 is zero-reload.
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
For TIBET IDE documentation see <http://www.technicalpursuit.com>.

# Help

You can get help on the `tibet` command by entering:

    tibet help


# Server Options

With TIBET you can use any REST-capable server you desire -- or no
server. TIBET is entirely server-agnostic.


### TIBET 

Create a full-stack client/server TIBET application using:

    tibet clone tibet {path}

This command will clone a TIBET client/server template you can run from
within your newly created application {path} via: 

    cd {path}
    npm start

    open http://127.0.0.1:3000/index.html

### Node.js + Connect

To use a generic Node.js server based on Connect use:

    tibet clone connect {path}

This command will create a simple node.js application based on Connect to get
you started. You can run your new application using:

    cd {path}
    npm start

    open http://127.0.0.1:3000/index.html

### Ruby-On-Rails 

TIBET also includes a Rails 3.x REST-driven application template. To use this
option invoke:

    tibet clone rails3 {path}

Run your new application using:

    cd {path}
    ./script/server

    open http://127.0.0.1:3000/index.html

### CouchDB 

TIBET can leverage CouchDB as a server, running your application as a CouchApp.
To create an application of this form:

1. Make sure your CouchDB server is running,
2. Note the URL of your CouchDB server,
3. Install a new app into CouchDB via:<br/>
<pre>
    tibet clone couch {couch-url} {path}

    open {couch-url}/{path}
</pre>

### Apache et. al.

In virtually all other cases you can simply link TIBET into the proper
directory for your server and add a reference to `tibet.js` to your
index.html. When you open your index.html file TIBET will attempt to
boot using the URL it was loaded from to find application resources.

Link TIBET into your server's directory tree using:

    tibet link {path}

### Zero Server

TIBET's micro-kernel (tibet.js) supports launching applications directly from
the file system without a server of any kind. To create a TIBET application of
this form use:

    tibet clone zero {path}

TIBET will create a new directory containing a simple application whose entry
point is the index.html file at the top of the directory tree. You can open this
file from the command line or by navigating to it from a modern web browser to
launch your application. (See File-based Security for additional details).

    open index.html 

OR, in a browser:

    file://{path}/index.html

##### File-based Security 

NOTE that some browsers have security constraints which may interfere with
launching from the file system. Depending on your deployment requirements you
can choose to configure your browser to allow file-system launching, install
your application as a browser extension, or use a temporary HTTP server to
bootstrap your application into browser storage where it can then run offline.

##### Http-based Bootstrap

If you're uncomfortable launching directly from the file system you can still
build applications that are pure client, you just need to launch the initial
index.html file from a web server, let TIBET load itself into your browser once,
and from that point on you can run your application as if you're offline.
TIBET is fully capable of running without communicating with a server to launch.

# Documentation

Product-specific documentation is hosted at <http://www.technicalpursuit.com>.

The GitHub-based [TIBET wiki](https://github.com/TechnicalPursuit/TIBET/wiki)
provides a forward-looking design blueprint and roadmap for TIBET's 
architecture, components, and construction standards.


# The Tag Store&trade;

TIBET tags are self-contained packages of web functionality you can create,
share, and leverage in the construction of your applications. The TIBET [Tag
Store&trade;](http://www.technicalpursuit.com/tibet/tagstore/) is our
hosted clearinghouse for tags and other TIBET-related products and
services.


# Contacting Us

The best way to communicate an issue, feature request, or code-related concern
is to use the GitHub issues list. We monitor this list actively and try to
leverage it to keep all discussion regarding TIBET centralized on GitHub.

If you have specific code you'd like us to consider we're always open to [pull
requests](http://help.github.com/articles/using-pull-requests). Using pull
requests is great way to keep discussion of new features visible to the entire
TIBET community.

Additional contact info is available at <http://www.technicalpursuit.com>. 

