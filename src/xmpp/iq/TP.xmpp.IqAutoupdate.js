//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.xmpp.IqAutoupdate}
 * @summary A wrapper for the IQ_AUTOUPDATE namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqAutoupdate');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqAutoupdate.set('namespace', TP.xmpp.XMLNS.IQ_AUTOUPDATE);

TP.xmpp.IqAutoupdate.set('childTags', TP.ac('release'));

TP.xmpp.IqAutoupdate.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqAutoupdate.Inst.defineMethod('getReleaseDescription',
function() {

    /**
     * @method getReleaseDescription
     * @summary Returns the description of the release specified by this node.
     * @returns {String}
     */

    var tpRelElem;

    if (TP.notValid(tpRelElem =
                    this.getElementsByTagName('release').first())) {
        return null;
    }

    return tpRelElem.getChildTextContent('desc');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqAutoupdate.Inst.defineMethod('getReleasePriority',
function() {

    /**
     * @method getReleasePriority
     * @summary Returns the priority assigned to the release described by this
     *     node.
     * @returns {String}
     */

    var tpRelElem;

    if (TP.notValid(tpRelElem =
                    this.getElementsByTagName('release').first())) {
        return null;
    }

    return tpRelElem.getAttribute('priority');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqAutoupdate.Inst.defineMethod('getReleaseURL',
function() {

    /**
     * @method getReleaseURL
     * @summary Returns the URL of the release specified by this node.
     * @returns {TP.uri.URL}
     */

    var tpRelElem;

    if (TP.notValid(tpRelElem =
                    this.getElementsByTagName('release').first())) {
        return null;
    }

    return TP.uc(tpRelElem.getChildTextContent('url'));
});

//  ------------------------------------------------------------------------

TP.xmpp.IqAutoupdate.Inst.defineMethod('getReleaseVersion',
function() {

    /**
     * @method getReleaseVersion
     * @summary Returns the version of the release specified by this node.
     * @returns {String}
     */

    var tpRelElem;

    if (TP.notValid(tpRelElem =
                    this.getElementsByTagName('release').first())) {
        return null;
    }

    return tpRelElem.getChildTextContent('version');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
