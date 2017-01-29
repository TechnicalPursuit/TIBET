(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta,
            router;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {type: 'mock', name: 'mock_post'};
        logger.system(
            TDS.colorize('loading mock ', 'dim') +
            TDS.colorize('POST /mock', 'mock'), meta);

        router = require('express').Router();

        /*
         */
        router.post('/mock', function(req, res) {
            res.json({fluffy: 456});
        });

        return router;
    };

}(this));
