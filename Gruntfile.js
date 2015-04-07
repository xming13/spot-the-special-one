module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {src: ['app/index.html'], dest: 'index.html'},
                    {expand: true, src: '**', cwd: 'app/images/', dest: 'images/'}
                ]
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: './'
            }
        },
        usemin: {
            html: 'index.html'
        },
        jsbeautifier: {
            files: ['app/js/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.registerTask('build', [
        'jsbeautifier',
        'copy:main',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'usemin'
    ]);
};