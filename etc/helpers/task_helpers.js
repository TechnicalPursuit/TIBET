/**
 * @overview Simple guard expression evaluator for the TWS task processor.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Returns a function which when executed will return an 'Evaluator' which
     * can be used to process simple boolean expressions.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the helper.
     */
    module.exports = function(options) {
        var app,
            TDS,
            logger,
            meta,
            Evaluator;

        app = options.app;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'plugin',
            name: 'tasks'
        };

        logger = options.logger.getContextualLogger(meta);
        logger.system('loading task guard evaluator');

        Evaluator = {};

        Evaluator.evaluate = function(expression, params) {
            var template,
                data,
                expr,
                result;

            data = params || {};

            //  Log the guard and optionally the data we'll use during any
            //  expansion that may be required.
            logger.info('evaluating: ' + expression);
            logger.debug('data: ' + TDS.beautify(data));

            try {
                //  This pair effectively takes any field references to
                //  parameter data etc. in the guard and expands them so we end
                //  up with a secondary expression with those values in place.
                template = TDS.template.compile(expression);
                expr = template(data);

                //  Output the "expanded" expression we'll be evaluating.
                logger.info('evaluating: ' + expr);

                try {
                    //  TODO:   replace with safe eval etc.
                    /* eslint-disable no-eval */
                    result = eval(expr);
                    /* eslint-enable no-eval */
                    result = Boolean(result);  //  always convert to a boolean
                } catch (e2) {
                    logger.error(e2);
                    result = false;
                }
            } catch (e) {
                logger.error(e);
                result = false;
            }

            return result;
        };

        return Evaluator;
    };

}(this));
