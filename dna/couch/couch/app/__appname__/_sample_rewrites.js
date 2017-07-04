(function() {
    'use strict';

    module.exports = [
        {from: '/', to: 'index.html'},
        {from: '/api', to: '../../'},
        {from: '/api/*', to: '../../*'},
        {from: '/*', to: '*'}
    ];

}());
