/**
 * Settings for default UIElementNode keybindings.
 */

//  Entries that map Ctrl-Z/Meta-Z into an Undo event.
TP.dom.UIElementNode.registerKeybinding('DOM_Ctrl_Z_Down', 'TP.sig.DOMUndo');
TP.dom.UIElementNode.registerKeybinding('DOM_Meta_Z_Down', 'TP.sig.DOMUndo');

//  Focus first/last
TP.dom.UIElementNode.registerKeybinding('DOM_Home_Down', 'TP.sig.UIFocusFirst');
TP.dom.UIElementNode.registerKeybinding('DOM_End_Down', 'TP.sig.UIFocusLast');

//  Focus next/previous field.
TP.dom.UIElementNode.registerKeybinding('DOM_Tab_Down', 'TP.sig.UIFocusNext');
TP.dom.UIElementNode.registerKeybinding('DOM_Shift_Tab_Down',
    'TP.sig.UIFocusPrevious');

//  Focus following/preceding (which can apply to traversing groups).
//  Note that, in practice, the notion of "navigate to next/previous field or
//  next/previous group if at end/start" can actually be a bit confusing.
TP.dom.UIElementNode.registerKeybinding('DOM_Ctrl_RightCurlyBracket_Down',
    'TP.sig.UIFocusFollowing');
TP.dom.UIElementNode.registerKeybinding('DOM_Ctrl_LeftCurlyBracket_Down',
    'TP.sig.UIFocusPreceding');

//  Focus first/last field in current group.
TP.dom.UIElementNode.registerKeybinding('DOM_PageUp_Down',
    'TP.sig.UIFocusFirstInGroup');
TP.dom.UIElementNode.registerKeybinding('DOM_PageDown_Down',
    'TP.sig.UIFocusLastInGroup');

//  Focus first in next/previous group.
TP.dom.UIElementNode.registerKeybinding('DOM_Ctrl_RightSquareBracket_Down',
    'TP.sig.UIFocusFirstInNextGroup');
TP.dom.UIElementNode.registerKeybinding('DOM_Ctrl_LeftSquareBracket_Down',
    'TP.sig.UIFocusFirstInPreviousGroup');

