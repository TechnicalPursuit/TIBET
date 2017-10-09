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
            hash,
            xhr,
            dat;

        if (!top.sessionStorage) {
            return;
        }

        form = document.getElementById('login');
        if (!form) {
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

        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status === 200) {
                window.location.replace('/');
            } else {
                window.location.replace('/login');
            }
        };

        dat = JSON.stringify({
            username: form[0].value.trim(),
            password: form[1].value.trim(),
            fragment: window.location.hash.toString()
        });

        xhr.open('POST', loc, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(dat);

        return false;
    };

}(this));
