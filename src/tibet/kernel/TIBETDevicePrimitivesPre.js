//  ========================================================================
/*
NAME:   TIBETDevicePrimitivesPre.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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

/*
Device (keyboard, mouse, etc) support routines needed prior to
browser-specific functionality.
*/

//  ------------------------------------------------------------------------

TP.W3C_EVENT_PROPERTIES =
    /(type|target|currentTarget|eventPhase|bubbles|cancelable|timeStamp)/;

TP.EXTRA_EVENT_PROPERTIES = /(offsetX|offsetY)/;

TP.TIBET_EVENT_PROPERTIES = TP.ac(
    '$$target',
        //  '$$currentTarget',  never used
    '$$type',
    '$$timestamp',
    '$$clientX',
    '$$clientY',
    '$$clientPt',
    '$$offsetX',
    '$$offsetY',
    '$$offsetPt',
    '$$view',
    '$$pageX',
    '$$pageY',
    '$$pagePt',
    '$$screenX',
    '$$screenY',
    '$$screenPt',
    '$$keyCode',
    '$$altKey',
    '$$ctrlKey',
    '$$shiftKey',
        //  '$$metaKey',        never used
    '$$button',
    '$$wheelDelta',
    '$$wheelDeltaX',
    '$$wheelDeltaY',
    '$captured',
    '$normalized',
    '$notSignaled',
    '$unicodeCharCode',
    '$computedName');

TP.DOM_EVENT_PROPERTIES = TP.ac(
    'bubbles',
    'cancelable',
    'currentTarget',
    'eventPhase',
    'target',
    'timeStamp',
    'type',

    //  DOM Level 3
    'defaultPrevented',
    'isTrusted');

TP.DOM_UI_EVENT_PROPERTIES = TP.DOM_EVENT_PROPERTIES.concat(
    TP.ac(
    'detail',
    'view',

    //  Old DOM Level 0
    'layerX',
    'layerY',
    'offsetX',
    'offsetY',
    'pageX',
    'pageY'));

TP.DOM_FOCUS_EVENT_PROPERTIES = TP.DOM_UI_EVENT_PROPERTIES.concat(
    TP.ac(
    'relatedTarget'));

TP.DOM_MOUSE_EVENT_PROPERTIES = TP.DOM_UI_EVENT_PROPERTIES.concat(
    TP.ac(
    'clientX',
    'clientY',
    'screenX',
    'screenY',

    'altKey',
    'ctrlKey',
    'shiftKey',
    'metaKey',

    'button',
    'buttons',
    'relatedTarget'));

TP.DOM_WHEEL_EVENT_PROPERTIES = TP.DOM_MOUSE_EVENT_PROPERTIES.concat(
    TP.ac(
    'wheelDelta',   //  Old IE/Webkit property (Mozilla used 'detail')
    'axis',         //  Old Mozilla property

    //  DOM Level 3
    'deltaMode',

    'deltaX',
    'deltaY',
    'deltaZ'));

TP.DOM_KEY_EVENT_PROPERTIES = TP.DOM_UI_EVENT_PROPERTIES.concat(
    TP.ac(

    //  DOM Level 3
    'char',
    'key',
    'locale',
    'location',
    'repeat',

    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',

    //  Deprecated in DOM Level 3
    'charCode',
    'keyCode',
    'which'));

TP.DOM_MUTATION_EVENT_PROPERTIES = TP.DOM_EVENT_PROPERTIES.concat(
    TP.ac(
    'relatedNode',
    'prevValue',
    'newValue',
    'attrName',
    'attrChange'));

//  ------------------------------------------------------------------------

//  NOTE that this is duplicated in the tibet_hook.js file so if you
//  change things here you'll want to keep the other version in sync
if (TP.notValid(TP.DOM_SIGNAL_TYPE_MAP)) {
    TP.DOM_SIGNAL_TYPE_MAP = TP.hc(
        'abort', 'TP.sig.DOMAbort',
        'blur', 'TP.sig.DOMBlur',
        'change', 'TP.sig.DOMChange',
        'click', 'TP.sig.DOMClick',
        'copy', 'TP.sig.DOMCopy',
        'contextmenu', 'TP.sig.DOMContextMenu',
        'cut', 'TP.sig.DOMCut',
        'dblclick', 'TP.sig.DOMDblClick',
        'error', 'TP.sig.DOMError',
        'focus', 'TP.sig.DOMFocus',
        'keydown', 'TP.sig.DOMKeyDown',
        'keypress', 'TP.sig.DOMKeyPress',
        'keyup', 'TP.sig.DOMKeyUp',
        'load', 'TP.sig.DOMLoad',
        'mousedown', 'TP.sig.DOMMouseDown',
        'mouseenter', 'TP.sig.DOMMouseEnter',
        'mousehover', 'TP.sig.DOMMouseHover',   //  a synthetic TIBET event
        'mouseleave', 'TP.sig.DOMMouseLeave',
        'mousemove', 'TP.sig.DOMMouseMove',
        'mouseout', 'TP.sig.DOMMouseOut',
        'mouseover', 'TP.sig.DOMMouseOver',
        'mouseup', 'TP.sig.DOMMouseUp',
        'dragdown', 'TP.sig.DOMDragDown',       //  a synthetic TIBET event
        'draghover', 'TP.sig.DOMDragHover',     //  a synthetic TIBET event
        'dragmove', 'TP.sig.DOMDragMove',       //  a synthetic TIBET event
        'dragout', 'TP.sig.DOMDragOut',         //  a synthetic TIBET event
        'dragover', 'TP.sig.DOMDragOver',       //  a synthetic TIBET event
        'dragup', 'TP.sig.DOMDragUp',           //  a synthetic TIBET event
        'move', 'TP.sig.DOMMove',
        'paste', 'TP.sig.DOMPaste',
        'reset', 'TP.sig.DOMReset',
        'resize', 'TP.sig.DOMResize',
        'submit', 'TP.sig.DOMSubmit',
        'unload', 'TP.sig.DOMUnload');

    if (TP.boot.isUA('GECKO')) {
        TP.DOM_SIGNAL_TYPE_MAP.atPut('DOMMouseScroll',
                                        'TP.sig.DOMMouseWheel');
    }

    if (TP.boot.isUA('IE') || TP.boot.isUA('WEBKIT')) {
        TP.DOM_SIGNAL_TYPE_MAP.atPut('mousewheel',
                                        'TP.sig.DOMMouseWheel');
    }
}

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
