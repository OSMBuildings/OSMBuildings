
module.exports = function(grunt) {

  grunt.initConfig({
    product: 'OSMBuildings',

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n',
        banner: 'var <%=product%> = (function(window) {\n\n',
        footer: '\nreturn <%=product%>; }(this));'
      },
      dist: {
        src: [grunt.file.readJSON('config.json').lib, grunt.file.readJSON('config.json').src],
        dest:  'dist/<%=product%>.debug.js'
      }
    },

    uglify: {
      options: {},
      build: {
        src: 'dist/<%=product%>.debug.js',
        dest: 'dist/<%=product%>.js'
      }
    },

    shaders: {
      dist: {
        src: 'src/shaders',
        dest: 'src/shaders.js'
      }
    },

    jshint: {
      options: {
         globals: {
           Map: true
         }
       },
      all: grunt.file.readJSON('config.json').src
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerMultiTask('shaders', 'Build shaders', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');

    var fs = require('fs');
    var dest = this.files[0].dest;

    var baseURL = this.files[0].src;

    var config = grunt.file.readJSON('config.json').shaders;
    var shader, type;
    var i, types = ['vertex', 'fragment'];
    var src, SHADERS = {};

    for (var name in config) {
      shader = config[name];

      SHADERS[name] = {
        src: {},
        attributes: shader.attributes,
        uniforms: shader.uniforms
      };

      for (i = 0; i < types.length; i++) {
        type = types[i];
        var src = fs.readFileSync(baseURL +'/'+ name +'.'+ type +'.glsl', 'ascii');
        SHADERS[name].src[type] = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
      }
    }

    fs.writeFileSync(dest, 'var SHADERS = '+ JSON.stringify(SHADERS) +';\n');
  });

  grunt.registerTask('default', 'Development build', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('shaders');
    grunt.task.run('concat');
    grunt.task.run('uglify');
  });

  grunt.registerTask('release', 'Release', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('jshint');
    grunt.task.run('default');
  });
};
