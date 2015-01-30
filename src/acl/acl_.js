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
 * @type {acl:}
 * @summary A simple namespace for managing user interface access control in a
 *     way that is easy for authors to manage.
 * @summary A common issue in web UI is to enable/disable, show/hide, or
 *     otherwise modify the UI based on current user and data values.
 *
 *     TIBET's TP.core.User type maintains two user identities, a "real" user
 *     and an "effective" user. The real user is typically the user instance
 *     associated with the server session (when there is a server :)) while the
 *     effective user is the user currently being used for "less privileged"
 *     areas of the user interface. This separation is most clearly seen in
 *     applications where an administrator may be operating on behalf of another
 *     user.
 *
 *     The permission keys associated with each of these users by virtue of
 *     their associated vCard data is automatically populated on all open window
 *     body elements by TIBET. In particular, the body element will contain an
 *     acl:real and acl:effective attribute which contain the current real and
 *     effective keys.
 *
 *     By creating CSS rules based on these strings you can manage a number of
 *     the common UI alterations without the need for code. For example
 *     combining the following element and CSS rules results in a div that is
 *     visible when the real user has ABC permission (presumably it's hidden
 *     otherwise):
 *
 *     <div xctrls:hidden="true" acl:if_real="ABC"/>
 *
 *     *[xctrls|hidden="true"] { display: none; }
 *
 *     body[acl|real~="ABC"] *[acl|if_real~="ABC"] { display: block; }
 *
 *     Common attributes for acl control are:
 *
 *     acl:if_real acl:if_effective acl:unless_real acl:unless_effective
 *
 *     These four attributes, combined with the body's acl:real and
 *     acl:effective values, allow you to create CSS rules that can selectively
 *     be applied to the various inclusion or exclusion rules you wish to apply
 *     based on real or effective user keys.
 *
 *     Most ACL rules leverage the ~= (contains) attribute selector so they can
 *     be leveraged against multiple key string values.
 *
 *     Note that you can combine these rules and standard CSS declarations to
 *     accomplish most tasks. When you need to do a little more custom
 *     processing you can leverage one or more -tibet* CSS declarations. These
 *     declarations provide you with a CSS-authored way of invoking more
 *     powerful operations when a particular CSS rule matches.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('acl:XMLNS');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
