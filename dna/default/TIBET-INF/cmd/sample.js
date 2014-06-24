/**
 * @overview Sample custom tibet command.
 */

;(function(root) {

var CLI = require('tibet/src/tibet/cli/_cli');

//  ---
//  Type Construction
//  ---

var parent = require('tibet/src/tibet/cli/_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.prototype.CONTEXT = CLI.CONTEXTS.BOTH;


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet sample [args]';


//  ---
//  Instance Methods
//  ---

Cmd.prototype.process = function(args) {
    this.log('sample command');
};


//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Cmd;
    }
    exports.Cmd = Cmd;
} else {
    root.Cmd = Cmd;
}

}(this));
