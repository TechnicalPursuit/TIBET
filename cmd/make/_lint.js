(function() {
    'use strict';

    var task;

    task = function(make, resolve, reject) {
        var proc;

        make.log('checking for lint...');

        proc = make.spawn('tibet lint --stop');
        proc.on('exit', function(code) {
            code === 0 ? resolve() : reject();
        });
    };

    task.options = {timeout: 1000 * 60 * 5};

    module.exports = task;
}());
