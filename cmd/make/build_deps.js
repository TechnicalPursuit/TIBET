(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building dependency packages...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        if (!make.sh.which('grunt')) {
            make.error('Building dependencies requires npm install -g grunt-cli.');
            reject();
            return;
        }

        //  Some npm modules that we use have leftover '.git' directories, which
        //  causes 'npm install' fits. Get rid of the them.
        make.sh.rm('-rf', make.CLI.joinPaths('.', 'node_modules', '*', '.git'));

        make.chain(
            '_rollup_ace',
            '_rollup_amazon_cognito_identity',
            '_rollup_aws_sdk',
            '_rollup_codemirror',
            '_rollup_cryptojs',
            '_rollup_bluebird',
            '_rollup_d3',
            '_rollup_diff',
            '_rollup_forge',
            '_rollup_fuse',
            '_rollup_jjv',
            '_rollup_jsonpath',
            '_rollup_jquery',
            '_rollup_jqueryxpath',
            '_rollup_jsforce',
            '_rollup_less',
            '_rollup_moment',
            '_rollup_mutation_summary',
            '_rollup_pouchdb',
            '_rollup_pouchdb_all_dbs',
            '_rollup_sinon',
            '_rollup_sprintf',
            '_rollup_syn',
            '_rollup_wgxpath',
            '_rollup_xpath'
        ).then(resolve, reject);
    };

}());
