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
        var usernameField,
            passwordField,

            loc,
            hash,

            pathname,

            xhr,

            dat;

        if (!top.sessionStorage) {
            return;
        }

        usernameField = document.getElementById('username');
        if (!usernameField) {
            /* eslint-disable no-console */
            console.log('Cannot find username field');
            /* eslint-enable no-console */
            return;
        }

        passwordField = document.getElementById('password');
        if (!passwordField) {
            /* eslint-disable no-console */
            console.log('Cannot find password field');
            /* eslint-enable no-console */
            return;
        }

        loc = root.location.toString();
        if (loc.indexOf('#') !== -1) {
            hash = loc.slice(loc.indexOf('#') + 1);
            if (hash) {
                top.sessionStorage.setItem('TIBET.boot.fragment', hash);
            }
            loc = loc.slice(0, loc.indexOf('#'));
        }

        pathname = top.location.pathname;

        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status === 200) {
                //  On success we want to go to the "post login" page.
                pathname = pathname.toString().replace(/\/login/, '/');
                window.location.replace(pathname);
            } else {
                //  If we failed to log in remain on the login page.
                window.location.replace(pathname);
            }
        };

        dat = JSON.stringify({
            username: usernameField.value.trim(),
            password: passwordField.value.trim(),
            fragment: window.location.hash.toString()
        });

        xhr.open('POST', loc, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(dat);

        return false;
    };

}(this));
