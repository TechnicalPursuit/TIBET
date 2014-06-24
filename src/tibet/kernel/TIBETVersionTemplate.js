//  ========================================================================
/*
NAME:   TIBETVersion.js
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

/*
@file           TIBETVersion.js
@abstract       This file provides version data for the current TIBET
                kernel. This file's content is built from
                TIBETVersionTemplate.js, which provides the source for this
                file while supporting build# and timestamp insertion via
                Ant. The data is in this file is then integrated with the
                kernel and made accessible via the TP.sys.getVersion*()
                methods.

                Kernel build numbers, which are effectively the TIBET
                release number, are an important element of managing
                technical support and automatic updates.
*/

//  ------------------------------------------------------------------------
//  VERSION IDENTIFIER
//  ------------------------------------------------------------------------

/*
Each release of the TIBET kernel is versioned to help with managing add-ons
and new revisions. The version identifier used for most processing is the
ISO8601-style version so tests about age of versions are easier.
*/

//  A Git hash, uniquely identifying the build
//TP.sys.$VERSION_HASH = <TODO>

TP.sys.$VERSION_NAME = 'Dharma';        //  version reference name

TP.sys.$VERSION_MAJOR = '3';            //  major version number
TP.sys.$VERSION_MINOR = '0';            //  minor version number
TP.sys.$VERSION_STATE = 'Final';        //  beta, rc, final?

TP.sys.$VERSION_DATE = '@DATETIME@';    //  last build date/time

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
