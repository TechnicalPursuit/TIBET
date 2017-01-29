(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {type: 'mock', name: 'mock_get'};
        logger.system(
            TDS.colorize('loading mock ', 'dim') +
            TDS.colorize('GET /mock', 'mock'), meta);

        /*
         */
        app.get('/mock', function(req, res) {
            res.json({fluffy: 123});
        });
    };

}(this));
