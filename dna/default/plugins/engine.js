/**
 * @overview Simple view engine configuration hook. This file is require()'d by
 *     the TDS to provide a way to alter the view engine used. The default
 *     engine is handlebars via: https://github.com/ericf/express-handlebars.
 */

(function() {

    var engine,
        handlebars;

    handlebars = require('express-handlebars');

    engine = {
        configure: function(app) {
            app.set('views', './views');
            app.engine('handlebars', handlebars({defaultLayout: 'main'}));
            app.set('view engine', 'handlebars');
        }
    };

    module.exports = engine;
}(this));
