(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var proc;

        make.log('checking for lint...');

        proc = make.spawn('tibet lint --stop');
        proc.on('exit', function(code) {
            code === 0 ? resolve() : reject();
        });
    };

}());
