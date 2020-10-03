/**
 * @overview Handlers for fallback conditions like 404's in the TDS.
 */

(function(root) {

    'use strict';

    /**
     * Installs a generic error handler for 404 errors that will render the
     * current 404.* view using the current view engine.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app;

        app = options.app;

        //  Serve a general 404 if no other handler too care of the request.
        app.get('/*', function(req, res, next) {
            var err;

            err = {
                status: 404,
                message: req.url + ' not found.'
            };

            res.status(404).render(
                '404',
                {
                    error: err
                });
        });
    };

}(this));
