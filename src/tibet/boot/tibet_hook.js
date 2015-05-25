/* copyright added via build process. see copyright.js in TIBET kernel */

/**
 * @overview When you use TIBET you're using a shared library model with code
 *     stored in a separate code frame while your user interface is typically
 *     drawn in an independent UI frame. To connect the UI frame to the shared
 *     library code TIBET leverages this "hook file" in any top-level page.
 *
 *     You should place a reference to this file in the head of any full page
 *     that you will load into your UI frame directly. NOTE that this file isn't
 *     needed in content that will be used as part of a larger DOM structure.
 *     Only the outermost documents you load at the window level require this
 *     reference if they will be calling on TIBET code from within the page.
 */

/* jshint debug:true,
          eqnull:true,
          maxerr:999
*/
/* global TP:true,
          Document:false
*/

//  ----------------------------------------------------------------------------

/* eslint indent:0 */
(function(root) {

    var $$location,
        $$fragment,
        $$root,
        $$msg,
        tibet;

//  ----------------------------------------------------------------------------

//  Patch ID from iframes onto the window name slot.
if (window.frameElement) {
    window.name = window.frameElement.id;
}

//  Capture either the iframe location or current location.
if (window.document && window.document.getElementsByTagName) {
    $$root = window.document.getElementsByTagName('html')[0];
    if ($$root) {
        $$location = $$root.getAttribute('tibet:globalDocID');
    }
}
$$location = $$location || window.location.toString();

//  ----------------------------------------------------------------------------

/*
 * Pre-launch checks.
 */

if (window.$$hooked === true) {

    //  If we're being pushed into an already hooked frame just stop.
    return;

} else {

    //  Need to try to find TIBET references.
    if (top.$$TIBET) {

        //  TIBET was found in top where we expect it. Map over TP.
        Object.defineProperty(window, 'TP', {value: top.TP, writable: false});

        if (TP.sys.cfg('log.hook') &&
                TP.sys.cfg('boot.context') !== 'phantomjs') {

            $$msg = 'TIBET hook in \'' + window.name +
                '\' found TIBET in \'top\'.';
            TP.boot.$stdout($$msg, TP.TRACE);
        }

        tibet = top.$$TIBET;
        window.onerror = tibet.onerror;
    } else {
        //  No TIBET and no config. Log to system console.
        top.console.log('TIBET hook in \'' + window.name +
            '\' unable to find TIBET.');

        //  "redirect" to the root location. This may cause TIBET to boot if the
        //  current file was a bookmarked content page.
        if (top.sessionStorage) {
            top.sessionStorage.setItem('TIBET.project.homepage',
                top.location.protocol + '//' + top.location.host +
                    top.location.pathname);
        }

        //  Rebuild the URL, minus any server path portion.
        $$fragment = /#/.test($$location) ?
            $$location.slice($$location.indexOf('#')) : '';

        $$location = '' + top.location.protocol + '//' + top.location.host +
            $$fragment;

        top.location = $$location;
        return;
    }
}

//  Output each window/frame and its location data as we process it.
if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'phantomjs') {
    $$msg = 'TIBET hook @ ' + window.name + ' -> ' + $$location;
    TP.boot.$stdout($$msg, TP.INFO);
}

//  ------------------------------------------------------------------------
//  location= trap
//  ------------------------------------------------------------------------

//  TODO:   is this necessary any longer? Does the logic above handle it?

/*
When a user clicks a link or a developer chooses to use window.location
rather than a TIBET setContent call the hook file will attempt to intercept
that operation and redirect it so that the content can be processed and
managed along with all other TIBET content.

NOTE that if you look closely you'll see that effectively the entire
remainder of the hook file is contained in the else clause of the following
if statement as a result.

NOTE ALSO: This only works for HTML documents, not XHTML documents.
*/

//  ------------------------------------------------------------------------

/*
if (window.onerror.failedlaunch !== true &&
    window !== top &&
    top.TP != null &&
    top.TP.sys != null &&
    top.TP.sys.hasLoaded() === true &&
    top.TP.isHTMLDocument(document) === true &&
    top.TP.core.Window.$$isDocumentWriting !== true &&
    window.frameElement != null &&
    window.frameElement.hasAttributeNS(
        'http://www.technicalpursuit.com/1999/tibet',
        'tibet:settinglocation') !== true) {
    //  if we're here because of a document.write then TIBET is
    //  processing the content already, otherwise we want to effectively
    //  snag the current location and ask TIBET to process that URI and
    //  return it to the current window as properly managed content
    top.TP.windowResetLocation(window);

    if (TP.sys.cfg('log.hook') && TP.sys.cfg('boot.context') !== 'phantomjs') {
        top.console.log('TIBET hook bailing out via location= trap');
    }
    return;
}
*/

//  ------------------------------------------------------------------------
//  Bundled or Unbundled Support
//  ------------------------------------------------------------------------

//  For Safari only...
if (!self.Window) {
    /* eslint-disable no-undef */
    Window = self.constructor; /* jshint ignore:line */
    /* eslint-enable no-undef */
}

//  ========================================================================
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
//  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE

//  THIS HAS TO BE THE LAST THING IN THIS FILE -- DO NOT ADD CODE BELOW IT
//  ========================================================================

if (window.onerror.failedlaunch === true) {

    //  We're done. the script already blew up with a file launch issue.
    return;
}

//  If we're still just trying to get the phaseone components loaded we should
//  keep overhead down until that process is finished.

//  TODO:   put a timer here rather than in the initialize canvas routine? Or
//  delay the initial invocation based on component count of the boot?


if (TP.sys && TP.sys.hasLoaded && TP.sys.cfg &&
    TP.sys.hasLoaded() === false && TP.sys.cfg('boot.twophase') === true) {

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
    //  particular will define phasetwo as true.

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
    if (window.$$phasetwo === true) {
        if (TP.sys.cfg('boot.phasetwo') === true) {
            //  if the load process is already working through phase two
            //  then we don't need to do anything more to ensure booting
            //  and we can be pretty sure that no matter where things
            //  are in the boot process we can start the initialization
            //  loop
            TP.boot.initializeCanvas(window);
        } else {
            //  to deal with the fact that the 'tibet' target may be in
            //  any stage of loading we'll create a function that either
            //  of the two sides can invoke to finish things
            TP.boot.bootPhaseTwo = function() {

                //  make sure the canvas is set up while the rest of the
                //  process runs to load the application code
                TP.boot.initializeCanvas(window);

                //  notify the main boot code logic that phase two
                //  should be imported. we'll leave it up to that code
                //  to do the real work :)
                TP.boot.$$importPhaseTwo();

                return;
            };

            //  if the boot is paused it's because we got here late, so
            //  it's up to us to trigger the final stage
            if (TP.boot.$$stage === 'import_paused') {
                TP.boot.bootPhaseTwo();
            }
        }
    } else {
        //  we must be a phase one page in a two-phase world. which
        //  means we might sit here forever waiting for the user to get
        //  authenticated or otherwise trigger a phase-two page. might
        //  as well initialize.
        TP.boot.initializeCanvas(window);
    }
} else {    //  single phase or post-boot
    //  when booting in single-phase mode every page can potentially be
    //  initialized (although they may be removed once the home page for
    //  the application loads)

    //  since we know that all code will load in a single phase without
    //  any kind of user-dependent pause we can start up the
    //  initializeCanvas loop here
    TP.boot.initializeCanvas(window);
}

//  ------------------------------------------------------------------------

}(this));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
