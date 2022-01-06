(function() {
    'use strict';

    var task;

    task = function(make, resolve, reject) {
        var proc;

        make.log('checking for lint...');

        proc = make.spawn('tibet', ['lint', '--stop']);
        proc.on('exit', function(code) {
            if (code === 0) {
                resolve();
            } else {
                make.error('make exiting with ' + code + ' lint errors.');
                reject();
            }
        });
    };

    task.options = {timeout: 1000 * 60 * 5};

    module.exports = task;
}());
