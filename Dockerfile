# THIS DOCKERFILE IS USED FOR LOCAL DEVELOPMENT WITH A SNAPSHOT OF THE LATEST
# TIBET CODE.

# Start with Node 12.X and the Debian Linux 'Stretch Slim' image.
FROM node:12.18.0-stretch-slim

# Grab the latest package definitions for apt-get
RUN apt-get update && apt-get install -y gnupg2

# Add git because some of TIBET's npm packages come from TPI forks of Git
# packages on Github (force 'yes' or otherwise Docker can't complete building
# the package).
RUN apt-get -y install git-core

# Add the prerequisites for Puppeteer.
RUN apt-get update \
     # Install latest chrome dev package, which installs the necessary libs to
     # make the bundled version of Chromium that Puppeteer installs work.
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable --no-install-recommends \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh

# Add the non-root 'developer' user.
RUN useradd -ms /bin/bash developer

# cd into the 'developer' user's home directory.
WORKDIR /home/developer

# Copy in the contents of TIBET from the local source directory into the
# Docker image's app directory. By specifying the '--chown' flag, we ensure that
# everything gets the proper permissions.
COPY --chown=node:node . .

# Remove the node_modules in order to get "architecture correct" versions of any
# binary dependencies below when we link. Note that we need to do this rather
# than put an entry for node_modules in .dockerignore since that file is shared
# with other images where we want the original node_modules.
RUN rm -rf node_modules

# Force npm to set the user to root and install TIBET *globally*. Note that
# forcing the npm user to be root solves multiple issues when installing npm
# packages as the root user, which is what we are until the USER command below.
# Also note that, because TIBET is a global package, it won't install TIBET's
# devDependencies. We'll do that in the step below.
RUN npm -g config set user root && npm install -g tibet

# Run a script in TIBET's bin directory that will install of its
# devDependencies.
RUN $(npm root -g)/tibet/bin/tibet_develop_init.bash

# Switch to the non-root 'developer' user.
USER developer

# Expose TIBET's favorite port :-). The container environment will map this port
# to whatever port it wants to, but by default the TDS listens on this port so
# exposing this port makes it easy.
EXPOSE 1407

# Set an entrypoint to bash and we're ready to go!
ENTRYPOINT /bin/bash
