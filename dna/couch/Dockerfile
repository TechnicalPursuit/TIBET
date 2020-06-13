# Start with Node 12.X and the Alpine Linux Docker image.
FROM node:12-alpine

# Add git because some of TIBET's npm packages come from TPI forks of Git
# packages on Github.
RUN apk add git

# Force npm to set the user to root and install TIBET *globally*. Note that
# forcing the npm user to be root solves multiple issues when installing npm
# packages as the root user, which is what we are until the USER command below.
# Note how we explicity pass '--production' to the 'npm install' of TIBET. This
# overrides any NODE_ENV setting in the container environment to only install
# 'dependencies', not 'dev dependencies'.
RUN npm -g config set user root && npm -g install tibet --production

# Make the 'node_modules' directory in the app and chown it to be the 'node'
# user and 'node' group. We need to do this to make sure the directory ownership
# and permissions are correct.
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# cd into our app directory.
WORKDIR /home/node/app

# Copy the package.json (and possibly package-lock.json) from the local source
# directory into the Docker image's app directory.
COPY package*.json ./

# Switch to the non-root 'node' user.
USER node

# Now that the above structure ensures that we can install the project's npm
# modules and that all of the permissions, etc. will be correct, we do so now.

# The '.dockerignore' file that comes with this project specifies that Docker
# should *not* copy the 'node_modules' directory from the local source
# directory. This is done on purpose because we want to re-run 'npm install'
# in the container here.

# By re-running 'npm install' in the container, we ensure that any npm modules
# that contain binary components that may differ between the host environment
# and the container get installed properly.
RUN npm install

# Since the '.dockerignore' file that comes with this project specifies that we
# are *not* to copy our 'node_modules' directory, including the link to the
# TIBET library codebase, we re-establish that link by running an
# 'npm link tibet'. This command will link TIBET from the globally-installed
# (into the container) version of TIBET (that we installed via the
# 'npm install -g tibet --prodution' command above) into our app.
RUN npm link tibet

# Copy all of the application code from the local source directory into the
# Docker image's app directory. By specifying the '--chown' flag, we ensure that
# everything gets the proper permissions.
COPY --chown=node:node . .

# Expose TIBET's favorite port :-). The container environment will map this port
# to whatever port it wants to, but by default the TDS listens on this port so
# exposing this port makes it easy.
EXPOSE 1407

# Start TIBET! :-)
CMD [ "tibet", "start" ]
