/**
 * Sample gruntfile.
 *
 * TIBET's cli will fall back to Grunt if you add 'grunt-cli' and the grunt task
 * modules appropriate to your tasks to package.json and npm install them.
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    grunt.registerTask('grunt', 'TIBET fallback task test.', function() {
        console.log('TIBET grunt fallback active.');
    });

    grunt.registerTask('default', ['grunt']);
};

