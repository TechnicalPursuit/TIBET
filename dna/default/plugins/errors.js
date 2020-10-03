/**
 * @overview Handler for internal server errors used as a fallback TDS option.
 */

/* eslint-disable no-console */
(function(root) {

    'use strict';

    /**
     * Installs a generic error handler for server errors that will render the
     * current 500.* view using the current view engine.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger;

        app = options.app;
        logger = options.logger;

        //  ---
        //  Middleware
        //  ---

        //  Internal server error handler. Just render the error template.
        app.use(function(err, req, res, next) {
            var env,
                stack;

            env = app.get('env');
            if (env === 'development') {
                stack = err.stack || '';
                logger.error(stack.replace(/\\n/g, '\n'));
            }

            res.status(err.status || 500).render(
                'error',
                {
                    error: err
                });
        });
    };

}(this));
