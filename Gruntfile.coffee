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

    copy:
      compile:
        files: [
            expand : true
            src  : "graphemescope.js"
            cwd  : "lib/"
            dest : "demo/vkapi/js/"
        ]


  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-copy"

  grunt.registerTask "default", [ "coffee", "copy" ]
