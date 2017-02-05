(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        logger.system(
            TDS.colorize('loading mock ', 'dim') +
            TDS.colorize('GET /mock', 'mock'));

        /*
         */
        app.get('/mock', function(req, res) {
            res.json({fluffy: 123});
        });
    };

}(this));
