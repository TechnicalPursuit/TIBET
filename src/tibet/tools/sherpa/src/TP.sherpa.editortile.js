//  ========================================================================
/*
NAME:   TP.sherpa.editortile.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sherpa.editortile}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.sherpa.tile.defineSubtype('sherpa:editortile');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.editortile.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineAttribute(
        'headerText',
        {'value': TP.cpc('.header_text', true)});

//  'path' object back
TP.sherpa.editortile.Inst.defineAttribute(
        'textInput',
        {'value': TP.cpc('xctrls|codeeditor', true)});

TP.sherpa.editortile.Inst.defineAttribute(
        'propertyList',
        {'value': TP.cpc('.editortile_property_list', true)});

TP.sherpa.editortile.Inst.defineAttribute(
        'headers',
        {'value': TP.cpc('h1', true)});

TP.sherpa.editortile.Inst.defineAttribute('currentTPElement');

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    this.observe(this, 'TP.sig.DOMClick');

    this.observe(TP.byOID('SherpaHalo', TP.win('UIROOT.SHERPA_FRAME')), 'TP.sig.HaloDidFocus');
    this.observe(TP.byOID('SherpaHalo', TP.win('UIROOT.SHERPA_FRAME')), 'TP.sig.HaloDidBlur');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('handleTP_sig_HaloDidFocus',
function(aSignal) {

    //this.show();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('handleTP_sig_HaloDidBlur',
function(aSignal) {

    //this.hide();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    var headers,
        i,
    
        elem,

        textInput,
        val,

        heading,
    
        replacement,
        focusElem,
    
        $$func;

    this.ignore(aSignal.getSignalOrigin(), aSignal.getSignalName);

    headers = this.get('headers');

    textInput = this.get('textInput');

    elem = null;
    for (i = 0; i < headers.getSize(); i++) {
        if (aSignal.getTarget() === headers.at(i).getNativeNode()) {
            elem = aSignal.getTarget();
            if (TP.elementHasAttribute(elem.parentNode, 'hidelist', true)) {
                TP.elementRemoveAttribute(elem.parentNode, 'hidelist', true);

                textInput.clearValue();

            } else {
                TP.elementSetAttribute(elem.parentNode, 'hidelist', 'true');
            }
            break;
        }
    }

    if (TP.notValid(elem)) {
        elem = aSignal.getTarget();
        if (TP.lname(elem) === 'li') {
            heading = TP.byCSS('h1', elem.parentNode.parentNode, true);
            this.displayEditorOnClick(heading, elem);
        } else if (TP.elementGetAttribute(elem, 'id', true) === 'saveButton') {
            if (TP.isValid(TP.$$targetMethod)) {
                if (TP.notEmpty(val = textInput.getDisplayValue())) {
val = 'TP.tibet.helloworld.defineMethod(\'tshCompile\',' + val + ');';

                    eval(val);

                    replacement = TP.unwrap(TP.process('<tibet:helloworld/>'));
                    //TP.$$currentFocus.setContent('<tibet:helloworld/>');

                    focusElem = TP.unwrap(TP.$$currentFocus);
                    TP.byOID('SherpaHalo').blur();

                    TP.$$currentFocus =
                        TP.wrap(
                            TP.nodeReplaceChild(
                                focusElem.parentNode,
                                replacement,
                                focusElem,
                                false));

                    TP.byOID('SherpaHalo').focusOn(TP.$$currentFocus);
                }
            }
        } else if (TP.elementGetAttribute(elem, 'id', true) === 'pushButton') {

            if (TP.isValid(TP.$$targetMethod) && TP.isValid(TP.$$originalTargetMethod)) {

                if (TP.notEmpty(val = textInput.getDisplayValue())) {
                    TP.$$originalTargetMethod.postMethodPatch(val);
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('displayEditorOnClick',
function(categoryElem, itemElem) {

    var categoryText,
        itemName,
   
        textInput,
    
        targetTPElement,
        targetType,
    
        natElem,
   
        str,

        i,

        rules,
        computed;

    categoryText = TP.nodeGetTextContent(categoryElem);
    itemName = TP.nodeGetTextContent(itemElem);

    textInput = this.get('textInput');
    textInput.clearValue();

    //targetTPElement = this.get('currentTPElement');
    targetTPElement = TP.$$currentFocus;
    targetType = TP.type(targetTPElement);
    natElem = targetTPElement.getNativeNode();

    TP.$$targetMethod = null;

    str = '';

    switch(categoryText) {
        case 'Special':
            switch(itemName) {
                case 'Generator':
                    if (targetType.ownsMethod('tshCompile')) {
                        textInput.setEditorMode('javascript');
                        TP.$$targetType = targetType;
                        TP.$$targetMethod = targetType.tshCompile;
                        if (TP.notValid(TP.$$originalTargetMethod)) {
                            TP.$$originalTargetMethod = TP.$$targetMethod;
                        }
                        str = TP.$$targetMethod.toString();
                    }
                break;
                case 'Markup':
                    textInput.setEditorMode(TP.ietf.Mime.XHTML);
                    str = TP.elementGetOuterContent(natElem);
                break;
            }
            break;
        case 'CSS Rules':
            textInput.setEditorMode(TP.ietf.Mime.CSS);
            rules = TP.elementGetAppliedNativeStyleRules(natElem);

            for (i = 0; i < rules.length; i++) {
                str += TP.boot.$uriInTIBETFormat(
                        rules[i].parentStyleSheet.href) + '\n\n';
                str += rules[i].cssText + '\n\n';
                str += '---\n\n';
            }

            break;

        case 'CSS Properties':
            textInput.setEditorMode(TP.ietf.Mime.CSS);
            computed = TP.elementGetComputedStyleObj(natElem);

            str += itemName + ': ' + computed[itemName] + ';';
    }

    textInput.setDisplayValue(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('drawPropertyList',
function() {

    var targetTPElement,
    
        groups,
    
        propertyList,
        result;

    targetTPElement = this.get('currentTPElement');
    targetTPElement = TP.$$currentFocus;

    groups = TP.hc();
    groups.atPut('Special', TP.ac('Generator','Markup'));
    groups.atPut('CSS Rules', TP.ac('Applied Rules'));
    groups.atPut('CSS Properties', TP.CSS_ALL_PROPERTIES);
    groups.atPut('DOM Properties', Object.keys(targetTPElement.getNativeNode()));
    groups.atPut('Introduced Methods',
                    targetTPElement.getInterface('known_introduced').sort());
    groups.atPut('Overridden Methods',
                    targetTPElement.getInterface('known_overridden').sort());
    groups.atPut('Inherited Methods',
                    targetTPElement.getInterface('known_inherited').sort());

    result = '';

    groups.perform(
            function(kvPair) {
                var list;

                result += '<section xmlns="' + TP.w3.Xmlns.XHTML + '" hidelist="true">';
                result += '<h1>' + kvPair.first() + '</h1>';

                if (TP.isEmpty(list = kvPair.last())) {
                
                    result += '</section>';

                    return;
                }

                result += '<ul>' +
                            list.as('html:li', TP.hc('repeat', true)) +
                            '</ul>';

                result += '</section>';
            });

    propertyList = this.get('propertyList');

    TP.xmlElementSetContent(propertyList.getNativeNode(),
                            TP.frag(result),
                            null,
                            true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('focusOn',
function(targetTPElement) {

    var textInput;

    textInput = this.get('textInput');

    textInput.clearValue();

    //textInput.setDisplayValue(
    //          TP.elementGetOuterContent(targetTPElement.getNativeNode()));

    //this.set('currentTPElement', targetTPElement);

    TP.$$currentFocus = targetTPElement;

    this.show();
    this.drawPropertyList();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('getEditorContentFor',
function(obj) {


    var str,
        name,
        owner,
        track;

    if (TP.isMethod(obj)) {
        if (TP.isValid(name = obj[TP.NAME]) &&
            TP.isValid(owner = obj[TP.OWNER]) &&
            TP.isValid(track = obj[TP.TRACK])) {
            str = TP.ac(owner.getName());

            if (track === 'Inst') {
                str.push('.Inst.defineMethod(\'');
            } else if (track === 'Type') {
                str.push('.Type.defineMethod(\'');
            }

            str.push(name, '\',\n', TP.str(obj), '\n);');

            str = str.join('');
        } else {
            str = TP.str(obj);
        }
    } else if (TP.isURI(obj)) {
        str = TP.str(obj.getResource(TP.hc('async', false)));
    } else {
        str = TP.str(obj);
    }

    return str;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
