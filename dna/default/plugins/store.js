/**
 * @overview Simple session store helper. You should replace logic here with
 *     logic appropriate to creating the session store you want to use such as
 *     Redis, CouchDB, etc. MemoryStore is not a production-class session store.
 */

(function() {

    var MemoryStore,
        session,
        store;

    session = require('express-session');
    MemoryStore = session.MemoryStore;

    store = new MemoryStore();

    module.exports = store;

}(this))
