(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var isFrozen,

            file,
            json,

            result,

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

        //  If we're doing a release, we want some sanity checks for certain
        //  properties
        if (make.options.release) {
            file = make.CLI.expandPath('~tibet_file');
            json = require(file);
            if (!json) {
                reject('Unable to check packaging information in: ' + file);
                return;
            }

            if (make.CLI.notEmpty(json.boot.profile) &&
                json.boot.profile !== 'main@production') {
                result = make.CLI.prompt.question(
                    'Your boot profile is not set to "main@production",' +
                    ' but is: "' + json.boot.profile + '".' +
                    ' This is not recommended.' +
                    '\nTo proceed with: "' + json.boot.profile +
                    '", enter \'yes\': ');
                if (!/^y/i.test(result)) {
                    reject('TIBET build cancelled.');
                    return;
                }
            }

            if (make.CLI.notEmpty(json.boot.teamtibet) &&
                json.boot.teamtibet === true) {
                result = make.CLI.prompt.question(
                    'Your boot teamtibet is set to: ' + json.boot.teamtibet + '.' +
                    ' This is not recommended.' +
                    '\nTo proceed with: ' + json.boot.teamtibet +
                    ', enter \'yes\': ');
                if (!/^y/i.test(result)) {
                    reject('TIBET build cancelled.');
                    return;
                }
            }
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
                mac: ['dmg:universal'],
                win: ['nsis:x64'],
                linux: ['snap:x64'],
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
