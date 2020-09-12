/* copyright added via build process. see copyright.js in TIBET kernel */

/**
 * @overview A simple helper for the default TIBET login page which stores off
 *     any client-side boot parameters for use after the login route has
 *     completed and the boot process begins. This is necessary in cases of
 *     using a login page in non-parallel mode since the server never sees the
 *     client parameters in the fragment and can't return them in the response.
 */

(function(root) {

    var tds_auth_uri;

    //  If TIBET has loaded we can ask cfg for the value...(or it can be spoofed
    //  in script content in the login page itself).
    try {
        tds_auth_uri = root.TP.tds_auth_uri ||
            root.TP.sys.getcfg('tds.auth.uri') ||
            root.TP.cfg.tds.auth.uri;
    } catch {
        tds_auth_uri = '/login';
    }

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
            var text,
                obj;

            if (xhr.readyState !== 4) {
                return;
            }

            //  Now that we've returned from the call, clear the opacity
            //  setting that we set below when we made the call.
            document.body.style.opacity = '';

            if (xhr.status === 200) {
                //  Save any JWT token we received so we can send back with any
                //  calls we make to the server.
                text = xhr.responseText;
                try {
                    obj = JSON.parse(text);
                    if (obj.token) {
                        top.sessionStorage.setItem(
                            'TIBET.boot.tibet_token', obj.token);
                    }
                } catch (e) {
                    void 0;
                }

                //  Go "home" and let it route now that authenticated.
                window.location.replace('/');
            } else {
                //  If we failed to log in remain on the login page.
                window.location.replace(tds_auth_uri);
            }
        };

        //  In case the login process takes a while, set the opacity on the body
        //  to be 50% and blur the active element to let the user know that user
        //  interaction really shouldn't be happening at this point.
        document.body.style.opacity = 0.5;
        document.activeElement.blur();

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
