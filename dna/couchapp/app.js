var couchapp,   // The couchapp module. Used for push support.
    path,       // The path module.
    ddoc;       // The design document we'll configure/push.

couchapp = require('couchapp');
path = require('path');
ddoc = {
    _id: '_design/app',
    rewrites: [
        {from: '/', to: 'index.html'},
        {from: '/api', to: '../../'},
        {from: '/api/*', to: '../../*'},
        {from: '/*', to: '*'}
    ]
};

ddoc.views = {};

ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {
    if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
        throw 'Only admin can delete documents on this database.';
    }
};

couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));

module.exports = ddoc;
