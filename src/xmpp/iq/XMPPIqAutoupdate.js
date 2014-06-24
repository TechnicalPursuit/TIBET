//  ========================================================================
/*
NAME:   TP.xmpp.IqAutoupdate.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.
*/
//  ========================================================================

/**
 * @type {TP.xmpp.IqAutoupdate}
 * @synopsis A wrapper for the IQ_AUTOUPDATE namespace'd payload element.
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
     * @name getReleaseDescription
     * @synopsis Returns the description of the release specified by this node.
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
     * @name getReleasePriority
     * @synopsis Returns the priority assigned to the release described by this
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
     * @name getReleaseURL
     * @synopsis Returns the URL of the release specified by this node.
     * @returns {TP.core.URL} 
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
     * @name getReleaseVersion
     * @synopsis Returns the version of the release specified by this node.
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
