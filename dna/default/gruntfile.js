/**
 * Grunt control file for template applications.
 */

module.exports = function(grunt) {

    // pull in TIBET's package expansion logic. this lets us build
    // file lists from TIBET package manifests.
    var Package = require(
        './node_modules/tibet3/base/lib/tibet/src/tibet_package.js');

    // utility function we can invoke to produce the lists we need
    var getConfigComponents = function(aPath, aConfig) {
        var pkg,
            path,
            config;

        path = aPath ? aPath : './TIBET-INF/tibet.xml';
        config = aConfig ? aConfig : 'tibet_img';

        package = new Package({
            assets: 'script',
            files: true
        });

        package.expandPackage(path, config);

        return package.listPackageAssets(path, config);
    };

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
        },

        concat: {
            tibet_img : {
                options: {
                    separator: ';'
                },
                files: {
                    'tibet_img.js': ['build/**/*.min.js']

                }
            }
        },

        uglify: {
            tibet_img : {
                options: {
                    mangle: false
                },
                files: [{
                    expand: true,
                    src: getConfigComponents(),
                    dest: 'build/',
                    ext: '.min.js'
                }]
            }
        }
    });

    // load the tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // define the tasks
    grunt.registerTask('lint', ['jshint']);

    grunt.registerTask('pack', ['uglify:tibet_img', 'concat:tibet_img']);

    grunt.registerTask('default', ['lint']);

    grunt.registerTask('list', function() {
        console.log(getConfigComponents());
    });
};

