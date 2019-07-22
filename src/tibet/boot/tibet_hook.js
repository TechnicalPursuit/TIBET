/* copyright added via build process. see copyright.js in TIBET kernel */

/**
 * @overview When you use TIBET you're using a shared library model with code
 *     stored in a separate code frame while your user interface is typically
 *     drawn in an independent UI frame. To connect the UI frame to the shared
 *     library code TIBET leverages this "hook file" in any window-level page.
 *
 *     You should place a reference to this file in the head of any full page
 *     that you will load into your UI frame directly. NOTE that this file isn't
 *     needed in content that will be used as part of a larger DOM structure.
 *     Only the outermost documents you load at the window level require this
 *     reference if they will be calling on TIBET code from within the page.
 */

/* global TP:true
*/

/* eslint indent:0 */

//  ----------------------------------------------------------------------------

//  Using a wrapper lets us use 'return' statements to exit early as needed.
(function(root) {

    var $$location,
        $$fragment,
        $$root,
        $$msg,
        $$find,
        tibet,

        $$url;

//  ----------------------------------------------------------------------------

//  Patch ID from iframes onto the window name slot.
if (root.frameElement) {
    root.name = root.frameElement.id;
}

//  Capture either the iframe location or current location.
if (root.document && root.document.getElementsByTagName) {
    $$root = root.document.getElementsByTagName('html')[0];
    if ($$root) {
        $$location = $$root.getAttribute('tibet:globaldocid');
    }
}
$$location = $$location || root.location.toString();

//  ----------------------------------------------------------------------------

if (root.$$hooked === true) {
    //  If we're being pushed into an already hooked frame just stop. NOTE that
    //  this property is also set by the late stages of the tibet_loader code
    //  which includes a copy of this hook file at the tail end.
    return;
}

//  ----------------------------------------------------------------------------
//  Find TIBET
//  ----------------------------------------------------------------------------

//  Obvious check is 'top' where we expect 99% of TIBET applications to load.
if (!top.$$TIBET) {

    $$find = function(aWindowOrFrame) {
        var win;

        win = aWindowOrFrame || root;
        if (win.$$TIBET) {
            return win;
        } else if (win === top) {
            //  Can't go any higher.
            return;
        }

        //  See if we're a frame, and if so recurse upward through window.
        if (win.frameElement &&
            win.frameElement.ownerDocument) {
            return $$find(win.frameElement.ownerDocument.defaultView);
        }
    };

    tibet = $$find(root);
    if (!tibet) {

        //  No TIBET and no config. Log to system console.
        top.console.log('TIBET hook in \'' + root.name +
            '\' unable to find TIBET.');

        //  Without TIBET we presume the user opened a tibet-hooked page but did
        //  that outside of a TIBET application. The idea here is to store that
        //  page in session storage and try to boot TIBET via a root (/) url. If
        //  that works TIBET will set the home page when it sees session value.
        if (top.sessionStorage) {
            top.sessionStorage.setItem('TIBET.project.home_page',
                top.location.toString());
        }

        //  Rebuild the URL, minus any server path portion.
        $$fragment = /#/.test($$location) ?
            $$location.slice($$location.indexOf('#')) : '';

        $$location = '' + top.location.protocol + '//' + top.location.host +
            $$fragment;

        top.location = $$location;
        return;
    } else {
        //  If TIBET is found then the current page shouldn't be preserved as a
        //  session var to drive home page on startup. Clear any value we have.
        if (top.sessionStorage) {
            top.sessionStorage.removeItem('TIBET.project.home_page');
        }
    }

} else {
    tibet = top.$$TIBET;

    //  If TIBET is found then the current page shouldn't be preserved as a
    //  session var to drive home page on startup. Clear any value we have.
    if (top.sessionStorage) {
        top.sessionStorage.removeItem('TIBET.project.home_page');
    }
}

Object.defineProperty(
    root,
    'TP',
    {
        value: tibet.TP, writable: false
    });

if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'headless') {
    $$msg = 'TIBET hook in \'' + root.name +
        '\' found TIBET in \'top\'.';
    TP.boot.$stdout($$msg, TP.TRACE);
}

root.onerror = tibet.onerror;

//  Output each window/frame and its location data as we process it.
if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'headless') {
    $$msg = 'TIBET hook @ ' + root.name + ' -> ' + $$location;
    TP.boot.$stdout($$msg, TP.INFO);
}

//  ------------------------------------------------------------------------
//  Shims
//  ------------------------------------------------------------------------

//  For Safari only...
if (!self.Window) {
    /* eslint-disable no-undef,no-global-assign */
    Window = self.constructor;
    /* eslint-enable no-undef,no-global-assign */
}

//  ========================================================================
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE

//  THIS HAS TO BE THE LAST THING IN THIS FILE -- DO NOT ADD CODE BELOW IT
//  ========================================================================

if (root.onerror.failedlaunch === true) {

    //  We're done. the script already blew up with a file launch issue.
    return;
}

//  If we're still just trying to get the phaseone components loaded we should
//  keep overhead down until that process is finished.

//  TODO:   put a timer here rather than in the initialize canvas routine? Or
//  delay the initial invocation based on component count of the boot?

if (TP.sys && TP.sys.hasLoaded && TP.sys.cfg &&
    TP.sys.hasLoaded() === false && TP.sys.cfg('boot.two_phase') === true) {

    //  found and mapped over the tibet window reference and it doesn't
    //  look like the system has finished booting phase two...

    //  two-phased booting means that we may well be in a UI page while
    //  the kernel is loading "underneath us" in the code frame. Since
    //  this is all happening asynchronously we want to avoid issues
    //  caused by assuming any functionality is in place before we
    //  initialize the canvas.

    //  the second issue is that we want pages to be able to trigger the
    //  second phase of the boot process when they represent a page that
    //  is a "phase two" page. "phase one" pages like most login_* pages
    //  don't trigger the app targets to load but the login_ok page in
    //  particular will define phase_two as true.

    //  the trick is getting the sequencing right. essentially we may
    //  have placed the phase two page in place before or after the
    //  phase one components complete their load process. when we get
    //  there early we have to wait until the boot completes. and if it
    //  were to fail for any reason we have to eventually terminate our
    //  observation so that the browser doesn't sit there iterating
    //  until the end of time. if we arrive late then the main boot
    //  logic won't be active any longer and we'll have to "reawaken it"
    //  to get it to pick up with phase two.

    //  we're in a page that says we can move on to phase two processing
    if (root.$$phase_two === true) {
        if (TP.sys.cfg('boot.phase_two') === true) {
            //  if the load process is already working through phase two
            //  then we don't need to do anything more to ensure booting
            //  and we can be pretty sure that no matter where things
            //  are in the boot process we can start the initialization
            //  loop
            TP.boot.initializeCanvas(root);
        } else {
            //  to deal with the fact that the 'tibet' target may be in
            //  any stage of loading we'll create a function that either
            //  of the two sides can invoke to finish things
            TP.boot.bootPhaseTwo = function() {
                //  notify the main boot code logic that phase two
                //  should be imported. we'll leave it up to that code
                //  to do the real work :)
                TP.boot.$$importPhaseTwo();

                return;
            };

            //  if the boot is paused it's because we got here late, so
            //  it's up to us to trigger the final stage. if the boot is still
            //  in progress it's up to the loader to detect we've set the
            //  $$phase_two flag and continue the boot process.
            if (TP.boot.$$stage === 'import_paused') {
                TP.boot.bootPhaseTwo();
            }
        }
    } else {
        //  we must be a phase one page in a two-phase world. which
        //  means we might sit here forever waiting for the user to get
        //  authenticated or otherwise trigger a phase-two page. might
        //  as well initialize.
        TP.boot.initializeCanvas(root);
    }
} else {    //  single phase or post-boot
    //  when booting in single-phase mode every page can potentially be
    //  initialized (although they may be removed once the home page for
    //  the application loads)

    //  Some browsers (Safari) have a race condition wherein the will set the
    //  location of the window to a path that doesn't point to a file. This
    //  should be an XML file of some sort. Therefore, if the URL doesn't end in
    //  one of our supported XML extensions, we don't initialize the canvas. We
    //  set the window's location to the blank page, which will cause it to come
    //  back through here.
    if (/.+\.(xhtml|svg)/.test(window.location.href)) {
        //  since we know that all code will load in a single phase without
        //  any kind of user-dependent pause we can start up the
        //  initializeCanvas loop here
        TP.boot.initializeCanvas(root);
    } else {
        $$url = TP.uc(TP.sys.cfg('path.blank_page'));
        window.location = $$url.getLocation();
    }
}

//  ------------------------------------------------------------------------

}(this));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
