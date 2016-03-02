//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.tibet.tofu}
 * @summary Bland and easily flavored :-)
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tibet:tofu');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.tofu.Inst.defineHandler('TagAssist',
function(aSignal) {

    /**
     * @method TagAssist
     * @summary
     * @param {TP.sig.TagAssist} aSignal The signal that caused this handler to
     *     trip.
     */

    var newTagName,

        newTagContentSection,
        newTagContent;

        /*
        consoleService;

        newTypeName,
        url,

        sourceTPElem,
        typeWasDefined,
        typeDefinedJob,

        req;
        */

    /*
    consoleService = TP.bySystemId('SherpaConsoleService');
    if (TP.notValid(consoleService)) {
        alert('This requires a running console');
    }
    */

    newTagName = this.getAttribute('proxyfor');

    newTagContentSection = this.getFirstDescendantByType(Node.CDATA_SECTION_NODE);
    newTagContent = newTagContentSection.getTextContent();

    //consoleService.sendConsoleRequest(
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText',
                        ':tag --assist' +
                        ' --name=\'' + newTagName + '\'' +
                        ' --template=\'' + newTagContent + '\''));

    //consoleService.sendConsoleRequest(
     //       ':cli tag --name="' + newTagName + '"');

    /*
    //newTypeName = 'APP.' + newTagName;
    //  TODO: sanity check them for non-alphanumeric 'command line' chars.

    //  The url root we want to send to is in tds.cli.url
    url = TP.uriJoinPaths(TP.sys.getLaunchRoot(), TP.sys.cfg('tds.cli.uri'));

    url += '?' + TP.httpEncode(
                    TP.hc('cmd', 'tag',
                            'name', newTypeName));

    url = TP.uc(url);
    if (TP.notValid(url)) {
        //  TODO: Raise here
        return this;
    }

    req = TP.sig.HTTPRequest.construct(
                    TP.hc('uri', url.getLocation()));

    req.defineHandler('RequestSucceeded',
                        function() {
                        });
    req.defineHandler('RequestFailed',
                        function() {
                            typeDefinedJob.kill();
                            //  TODO: Raise here
                            return this;
                        });

    sourceTPElem = this;
    typeWasDefined = false;

    //  schedule a job to check on the window's close status
    typeDefinedJob = TP.schedule(
            TP.hc(
                'step',
                function() {

                    var newElem;

                    typeWasDefined =
                        TP.isType(TP.sys.getTypeByName(newTypeName));

                    if (typeWasDefined) {
                        newElem = TP.nodeFromString('<' + newTagName + ' id="newFluffy"/>');
                        if (TP.isElement(newElem)) {
                            sourceTPElem.replaceContent(newElem);
                        }

                        consoleService.sendConsoleRequest(
                                'x = TP.byId(\'newFluffy\', TP.sys.getUICanvas()) .; :edit x');

                        //  We found the type - no matter what happened with the
                        //  element, we return true.
                        return true;
                    }

                    return typeWasDefined;
                },
                'delay', 100,       //  start after 100ms second
                'interval', 250,    //  repeat every quarter second
                'limit',
                function(aJob) {

                    //  don't run more than 5 times
                    //  (100, 350, 600, 850, 1100, 1350, 1600, 1850, 2100)
                    if (aJob.get('iteration') > 10) {
                        return true;
                    }

                    //  Check succeeded above - just return true here to stop.
                    if (typeWasDefined) {
                        return true;
                    }

                    return false;
                }));

    url.httpPost(req);
*/

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
