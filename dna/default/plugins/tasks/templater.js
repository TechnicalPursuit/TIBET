/**
 * @overview Simple task runner for blending TWS job data with a template.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *       Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *       OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *       for your rights and responsibilities. Contact TPI to purchase optional
 *       open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            TDS,
            meta,
            helpers;

        //  ---
        //  Loadtime
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 'templater'
        };
        logger = logger.getContextualLogger(meta);

        //  See if we have local extensions to the templating engine to process.
        try {
            helpers = require('./_template_helpers');
            if (helpers) {
                helpers(TDS, meta);
            }
        } catch (e) {
            void 0;
        }

        //  ---
        //  Runtime
        //  ---

        /**
         * The exection function invoked by the TWS engine.
         */
        return function(job, step, params) {
            var template,
                templatePath,
                execTemplate,
                promisifiedExec;

            logger.trace(TDS.beautify(step));

            //  Ensure we have a template to process. This should be provided
            //  via the job parameters, not via any external input.
            if (!params.template) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured templater task. Missing params.template.'));
            }

            //  If the template reference is a file reference read the template
            //  content from the file and set that as our template content.
            if (params.template.startsWith('~')) {
                templatePath = TDS.expandPath(params.template);

                //  File has to reside _inside_ the project...
                if (templatePath.indexOf(
                        TDS.expandPath('~tds_templates')) !== 0) {
                    return TDS.Promise.reject(new Error(
                        'Misconfigured templater task.' +
                        ' Template outside project: ' +
                        templatePath));
                }

                //  And file has to exist...
                if (!TDS.shell.test('-e', templatePath)) {
                    return TDS.Promise.reject(new Error(
                        'Misconfigured templater task. Template not found: ' +
                        templatePath));
                }

                template = TDS.shell.cat(templatePath);
            } else {
                template = params.template;
            }

            //  The templating process is defined to run from 'input' whatever
            //  that is set to. So ensure we have access to that value.
            if (!params.input) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured templater task. Missing params.input.'));
            }

            //  Simple execution function for running the template.
            execTemplate = function(templ, input, callback) {
                var templateFunc,
                    result;

                try {
                    templateFunc = TDS.template.compile(templ, {
                        noEscape: true
                    });
                    result = templateFunc(input);

                    callback ? callback(null, result) : void 0;
                } catch (e) {
                    callback ? callback(e, e.message) : void 0;
                }
            };

            promisifiedExec = TDS.Promise.promisify(execTemplate);

            return promisifiedExec(template, TDS.blend({}, params)).then(
                function(result) {
                    step.stdout = {result: result};
                },
                function(err) {
                    step.stderr = {error: err};
                }
            );
        };
    };

}(this));
