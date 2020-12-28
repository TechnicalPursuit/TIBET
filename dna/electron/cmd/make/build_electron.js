(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var isFrozen,

            electronBuilder,

            etcPath,
            configPath,

            updateURL,

            electronConfig,

            promise;

        isFrozen = make.CLI.isFrozen();
        if (isFrozen) {
            reject('Project already frozen. Please thaw and try again.');
            return;
        }

        electronBuilder = require('electron-builder');

        etcPath = make.CLI.joinPaths(
                        make.CLI.expandPath('~app'),
                        'etc');

        configPath = make.CLI.joinPaths(
                        etcPath,
                        'electron-builder-config.json');

        updateURL = make.CLI.cfg('deploy.electron.updateURL', null, true);

        electronConfig = require(configPath);

        //  Add a 'publish' config, even though we're not publishing in this
        //  step - that takes place in our deploy command.. This 'provider' won't
        //  actually copy files anywhere, but is necessary to generate the proper
        //  .yml files for when we actually deploy.
        electronConfig.publish = [
            {
                provider: 'generic',
                url: updateURL
            }
        ];

        promise = new Promise(function(resolver, rejector) {

            make.sh.exec('tibet freeze --standalone --source');

            return electronBuilder.build({
                mac: ['default'],
                win: ['default'],
                config: electronConfig
            }).then(
                function() {
                    return resolver();
                },
                function(err) {
                    return rejector(err);
                }
            );
        });

        promise.then(function() {
                make.sh.exec('tibet thaw --force');
        }).then(resolve, reject);
    };

    module.exports.options = {
        timeout: 1000 * 60 * 10
    };

}());
