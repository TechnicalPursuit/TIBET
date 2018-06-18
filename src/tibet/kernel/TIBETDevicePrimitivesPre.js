//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
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
    '$$globalPt',
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
        'animationend', 'TP.sig.DOMAnimationEnd',
        'blur', 'TP.sig.DOMBlur',
        'change', 'TP.sig.DOMChange',
        'click', 'TP.sig.DOMClick',
        'copy', 'TP.sig.DOMCopy',
        'contextmenu', 'TP.sig.DOMContextMenu',
        'cut', 'TP.sig.DOMCut',
        'dblclick', 'TP.sig.DOMDblClick',
        'error', 'TP.sig.DOMError',
        'focus', 'TP.sig.DOMFocus',
        'input', 'TP.sig.DOMInput',
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
        'scroll', 'TP.sig.DOMScroll',
        'submit', 'TP.sig.DOMSubmit',
        'transitionend', 'TP.sig.DOMTransitionEnd',
        'unload', 'TP.sig.DOMUnload');

    if (TP.sys.isUA('GECKO')) {
        TP.DOM_SIGNAL_TYPE_MAP.atPut('DOMMouseScroll',
                                        'TP.sig.DOMMouseWheel');
    }

    if (TP.sys.isUA('IE') || TP.sys.isUA('WEBKIT')) {
        TP.DOM_SIGNAL_TYPE_MAP.atPut('mousewheel',
                                        'TP.sig.DOMMouseWheel');
    }
}

//  A Hash containing keys/values of 'on:*' attribute names and signals that
//  will not be processed via observe/ignore in the notification system because
//  they're handled specially.
if (TP.notValid(TP.NON_OBSERVED_ON_ATTRS)) {

    //  We start with the list of DOM signals. Whether platform-supplied or a
    //  synthetic TIBET event, it doesn't matter. These are handled specially.
    TP.NON_OBSERVED_ON_ATTRS = TP.hc(TP.DOM_SIGNAL_TYPE_MAP);

    //  Then we add the signals for attach/detach. These are handled by the
    //  awakening processing phase and so don't need to be handled via
    //  observe/ignore.
    TP.NON_OBSERVED_ON_ATTRS.atPut('attach', 'TP.sig.AttachComplete');
    TP.NON_OBSERVED_ON_ATTRS.atPut('detach', 'TP.sig.DetachComplete');
}

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
