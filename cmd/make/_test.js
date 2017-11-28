(function() {
    'use strict';

    var task;

    task = function(make, resolve, reject) {
        var proc;

        make.log('running unit tests...');

        proc = make.spawn('tibet test');
        proc.on('exit', function(code) {
            code === 0 ? resolve() : reject();
        });
    };

    task.options = {timeout: 1000 * 60 * 15};

    module.exports = task;
}());
