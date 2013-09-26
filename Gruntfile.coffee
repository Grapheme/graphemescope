module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    watch:
      options: 
        livereload : true   
      compile:
        files : [ "src/*.coffee" ]
        tasks : [ "default" ]

    coffee:
      compile:
        files:
          "lib/graphemescope.js" : [ "src/*.coffee" ]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "default", [ "coffee" ]
