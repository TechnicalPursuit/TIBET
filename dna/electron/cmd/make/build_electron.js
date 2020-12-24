(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var electronBuilder,

            etcPath,
            configPath,

            electronConfig,

            isFrozen,

            promise;

        electronBuilder = require('electron-builder');

        etcPath = make.CLI.joinPaths(
                        make.CLI.expandPath('~app'),
                        'etc');

        configPath = make.CLI.joinPaths(
                        etcPath,
                        'electron-builder-pack.json');

        electronConfig = require(configPath);

        isFrozen = make.CLI.isFrozen();

        if (isFrozen) {
            reject('Project already frozen. Please thaw and try again.');
            return;
        }

        promise = new Promise(function(resolver, rejector) {

            make.sh.exec('tibet freeze --standalone --source');

            return electronBuilder.build({
                mac: ['default'],
                win: ['default'],
                publish: 'never',
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
