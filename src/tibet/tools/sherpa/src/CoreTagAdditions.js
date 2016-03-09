//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.core.TemplatedTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Inst.defineMethod('getDefaultEditingAspect',
function() {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    return this.getType().getResourceURI('template', TP.ietf.Mime.XHTML);
});

//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Inst.defineMethod('getEditingAspectNamed',
function(anAspectName) {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    switch (anAspectName) {

        case 'structure':
            return this.getType().getResourceURI('template', TP.ietf.Mime.XHTML);

        case 'style':
            return this.getType().getResourceURI('style', TP.ietf.Mime.CSS);

        default:
            break;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.CompiledTag.Inst.defineMethod('getDefaultEditingAspect',
function() {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    var ourType;

    ourType = this.getType();

    if (TP.owns(ourType, 'tagCompile')) {
        return ourType.tagCompile;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.CompiledTag.Inst.defineMethod('getEditingAspectNamed',
function(anAspectName) {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    switch (anAspectName) {

        case 'structure':
            return this.getDefaultEditingAspect();

        case 'style':
            return this.getType().getResourceURI('template', TP.ietf.Mime.CSS);

        default:
            break;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.tsh.Element.Inst.defineMethod('getDefaultEditingAspect',
function() {

    /**
     * @method getDefaultEditingAspect
     * @summary
     * @returns
     */

    var ourType;

    ourType = this.getType();

    if (TP.owns(ourType, 'tshExecute')) {
        return ourType.tshExecute;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
