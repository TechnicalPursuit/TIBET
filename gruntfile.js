module.exports = function(grunt) {

    // configure the tasks
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            // define the files to lint
            files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],

            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {

                // more options here if you want to override JSHint defaults
                globals: {
                    console: true,
                    module: true
                }
            }
        }
    });

    // load the tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // define the tasks
    grunt.registerTask('lint', ['jshint']);
};

