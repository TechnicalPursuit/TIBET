/**
 * @overview Sample route returning an Express 'Router' which handles one or
 *     more paths below the root defined by this file's name. For example, if
 *     you rename this file 'router' and retain the post to /forminput you
 *     will be able to POST to /router/forminput. To support responding to
 *     /router simply add a get/post registration for '/' in this file.
 */

(function(root) {

    'use strict';

    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta,
            router,
            viewpath;

        //  Default references we'll need.
        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Meta information used by logger to identify component etc.
        meta = {type: 'route', name: 'view'};

        //  Announce the loading/config of this route.
        logger.system(
            TDS.colorize('loading route ', 'dim') +
            TDS.colorize('GET /*', 'route'), meta);

        viewpath = TDS.joinPaths(TDS.getAppHead(), 'views');

        //  ---
        //  Route(s)
        //  ---

        app.get('*', function(req, res, next) {
            var url,
                sliced,
                fullpath;

            url = req.params[0];
            sliced = url.slice(1, url.lastIndexOf('.'));
            fullpath = TDS.expandPath(TDS.joinPaths(viewpath, sliced + '.handlebars'));

            if (TDS.shell.test('-e', fullpath)) {
                try {
                    res.render(sliced, {layout: 'main'});
                } catch (e) {
                    logger.error('Error rendering ' + url);
                    logger.error(e);

                    res.render('404', {layout: 'main',
                        error: {
                            status: 404,
                            message: '/docs' + req.url + ' not found.'
                        }
                    });
                }
            } else {
                return next();
            }
        });
    };

}(this));
