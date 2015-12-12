/* copyright added via build process. see copyright.js in TIBET kernel */

/**
 * @overview A simple helper for the default TIBET login page which stores off
 *     any client-side boot parameters for use after the login route has
 *     completed and the boot process begins. This is necessary in cases of
 *     using a login page in non-parallel mode since the server never sees the
 *     client parameters in the fragment and can't return them in the response.
 */

(function(root) {

    root.login = function() {
        var form,
            loc,
            hash;

        if (!top.sessionStorage) {
            return;
        }

        form = document.getElementById('login');
        if (!form) {
            return;
        }

        loc = root.location.toString();
        hash = loc.slice(loc.indexOf('#') + 1);
        if (hash) {
            top.sessionStorage.setItem('TIBET.boot.fragment', hash);
        }

        form.submit('/login');
    };

}(this));
