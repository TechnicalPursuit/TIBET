TIBET v5.0.0
============

TIBET 5.0 is a modular, markup-centric, zero-reload web platform built to make
web development more scalable, more maintainable, and more efficient.

#### TIBET 5.0 is modular.
TIBET 5.0 is a modular client and server system which allows you to choose which
configuration: client/server, server-only, or client-only, you wish to use. With
TIBET there's no requirement that you transition in one giant, potentially
risky, step. You can integrate as much or as little of TIBET as your individual
projects require and increase your level of integration over time.

#### TIBET 5.0 is markup-centric.
Tags are the central organizing principle for functionality in TIBET. Just as
with HTML, TIBET development focuses on creating, combining, and configuring
tags. TIBET's tag library, and our TIBET Tag Store&trade; ecosystem, give you
access to an ever-increasing library of reusable functionality in markup form. 

#### TIBET 5.0 is zero-reload.
TIBET's client and server are engineered to ultimately eliminate costly server
restart and client reload cycles. With TIBET you develop live while your
application is running. All of TIBET is hot-reload ready.

Installation
------------

The TIBET platform is available as a single NPM package installed via:

    npm install -g tibet

Once you've installed the TIBET platform you utilize the `tibet` command to
perform your application creation, configuration, testing, and deployment.

Use the `tibet help` command to view documentation on the `tibet` command
supplied with your release.

    tibet help

Quick Start
-----------

To create your first TIBET application you use the `tibet` command's `clone`
operation. You can clone any application with this approach, but you'll
typically use one of the templates provided with your TIBET release.

### Client-Server App

In the following example we'll create a new application with both a client and
server component by cloning TIBET's client-server application template:

    tibet clone client-server hello-full

With an application clone in place you can now move into the hello-full
directory and start your application's server:

    cd hello-full
    tibet server start

Open the server's default index.html page and you're up and running:
    
    http://localhost:9313/index.html

See the TIBET documentation for more information on how to take your next step.

### Server-Only App

You can also create server-only applications, applications where you wish to
deploy an alternative client-side technology, by cloning a server-only template:

    tibet clone server hello-server

The rest of your steps remain the same however no TIBET client code will be
loaded with this template, just a standard HTML page containing the template's
default HTML content:

    cd hello-server
    tibet server start
    http://localhost:9313/index.html

See the TIBET documentation for more information on how to take your next step.

### Client-Only App

Finally, you can use TIBET without a server with a little extra configuration.
We won't go into the details here but, if you know your browser is configured
to load JavaScript applications from the file system, you can use the following
steps to create a zero-server TIBET application and start it:

    tibet clone client hello-client
    cd hello-client
    open index.html 

See the TIBET documentation for more information on how to take your next step.

Documentation
-------------

The GitHub-based [TIBET wiki](https://github.com/TechnicalPursuit/TIBET/wiki)
is a great place to get started. Documentation in the TIBET wiki is focused on
topics of particular interest if you want to learn more about TIBET's overall
architecture, construction standards, and project roadmap.

Full product documentation is hosted at <http://www.technicalpursuit.com>.

The Tag Store&trade;
--------------------

TIBET tags are self-contained packages of web functionality you can create,
share, and leverage in the construction of your applications. The TIBET Tag
Store&trade; is our hosted clearinghouse for tags and other TIBET-related
products and services.

Visit the TIBET Tag Store&trade; at <http://www.technicalpursuit.com/tibet/tagstore/>.

Contacting Us
-------------

The best way to communicate an issue, feature request, or code-related concern
is to use the GitHub issues list. We monitor this list actively and try to
leverage it to keep all discussion regarding TIBET centralized on GitHub.

If you have specific code you'd like us to consider we're always open to [pull
requests](http://help.github.com/articles/using-pull-requests). Using pull
requests is great way to keep discussion of new features visible to the entire
TIBET community.

Additional contact info is available at <http://www.technicalpursuit.com>. 
