(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            router;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        logger.system(
            TDS.colorize('loading mock ', 'dim') +
            TDS.colorize('POST /mock', 'mock'));

        router = require('express').Router();

        /*
         */
        router.post('/mock', function(req, res) {
            res.json({fluffy: 456});
        });

        return router;
    };

}(this));
