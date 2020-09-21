/**
 * @overview TIBET platform "makefile". Targets here focus on packaging the
 *     various portions of the platform for inclusion in TIBET applications.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

(function() {

    'use strict';

    module.exports = function(Make) {

        Make.loadTasks();

        Make.defineTaskOptions('build', {timeout: 1000 * 60 * 30});
        Make.defineTaskOptions('build_tibet', {timeout: 1000 * 60 * 30});
        Make.defineTaskOptions('build_all', {timeout: 1000 * 60 * 30});

        Make.defineTaskOptions('checkup', {timeout: 1000 * 60 * 10});

        Make.defineTaskOptions('_rollup_base', {timeout: 1000 * 60 * 10});
        Make.defineTaskOptions('_rollup_baseui', {timeout: 1000 * 60 * 10});
        Make.defineTaskOptions('_rollup_contributor', {timeout: 1000 * 60 * 10});
        Make.defineTaskOptions('_rollup_developer', {timeout: 1000 * 60 * 10});
        Make.defineTaskOptions('_rollup_full', {timeout: 1000 * 60 * 10});
    };

}());
