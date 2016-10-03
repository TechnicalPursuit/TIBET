/**
 * Settings for default UIElementNode keybindings.
 */

//  Entries that map Ctrl-Z/Meta-Z into an Undo event.
TP.core.UIElementNode.registerKeybinding('DOM_Ctrl_Z_Down', 'TP.sig.DOMUndo');
TP.core.UIElementNode.registerKeybinding('DOM_Meta_Z_Down', 'TP.sig.DOMUndo');

//  Focus first/last
TP.core.UIElementNode.registerKeybinding('DOM_Home_Down', 'TP.sig.UIFocusFirst');
TP.core.UIElementNode.registerKeybinding('DOM_End_Down', 'TP.sig.UIFocusLast');

//  Focus next/previous field.
TP.core.UIElementNode.registerKeybinding('DOM_Tab_Down', 'TP.sig.UIFocusNext');
TP.core.UIElementNode.registerKeybinding('DOM_Shift_Tab_Down',
    'TP.sig.UIFocusPrevious');

//  Focus following/preceding (which can apply to traversing groups).
TP.core.UIElementNode.registerKeybinding('DOM_Ctrl_Tab_Down',
    'TP.sig.UIFocusFollowing');
TP.core.UIElementNode.registerKeybinding('DOM_Ctrl_Shift_Tab_Down',
    'TP.sig.UIFocusPreceding');

//  Focus first/last field in current group.
TP.core.UIElementNode.registerKeybinding('DOM_PageUp_Down',
    'TP.sig.UIFocusFirstInGroup');
TP.core.UIElementNode.registerKeybinding('DOM_PageDown_Down',
    'TP.sig.UIFocusLastInGroup');

//  Focus first in next/previous group.
TP.core.UIElementNode.registerKeybinding('DOM_Ctrl_PageUp_Down',
    'TP.sig.UIFocusFirstInPreviousGroup');
TP.core.UIElementNode.registerKeybinding('DOM_Ctrl_PageDown_Down',
    'TP.sig.UIFocusFirstInNextGroup');


