
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: "\n",
        banner: "(function(global) {",
        footer: "}(this));"
      },
      dist: {
        src: [grunt.file.readJSON('config.json').lib, grunt.file.readJSON('config.json').src],
        dest: 'dist/OSMBuildings/<%=pkg.name%>.debug.js'
      }
    },

    uglify: {
      options: {},
      build: {
        src: 'dist/OSMBuildings/<%=pkg.name%>.debug.js',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.js'
      }
    },

    shaders: {
      dist: {
        src: 'src/shader',
        dest: 'src/Shaders.min.js',
        names: grunt.file.readJSON('config.json').shaders
      }
    },

    clean: {
      dist: ['./dist/OSMBuildings/<%=pkg.name%>.pack.js']
    },

    copy: {
      dist: [{
        src: 'src/skydome.jpg',
        dest: 'dist/OSMBuildings/skydome.jpg'
      }]
    },

    jshint: {
      options: {
         globals: {
           Map: true
         }
       },
      all: grunt.file.readJSON('config.json').src
    },

    // just testing, whether wepack *would* work
    webpack: {
      test: {
        entry: './dist/OSMBuildings/<%=pkg.name%>.debug.js',
        output: {
            path: './dist/OSMBuildings',
            filename: '<%=pkg.name%>.pack.js',
        },
        stats: false, // the stats output
        progress: false, // show progress
        failOnError: true, // don't report error to grunt if webpack find errors
        watch: false,
        keepalive: true // don't finish the grunt task
      }
    }
        
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerMultiTask('copy', 'Copy Files', function() {
    var fs = require('fs');
    var config = grunt.config.data.copy.dist;
    for (var i = 0; i < config.length; i++) {
      fs.writeFileSync(config[i].dest, fs.readFileSync(config[i].src));
    }
  });

  grunt.registerMultiTask('shaders', 'Build shaders', function() {
    var fs = require('fs');

    // grunt.log.writeln(JSON.stringify(this.data));
    var config = this.data;

    var src, name, Shaders = {};
    for (var i = 0; i < config.names.length; i++) {
      name = config.names[i];
      Shaders[name] = {};

      src = fs.readFileSync(config.src + '/' + name + '.vs', 'ascii');
      Shaders[name].vertex = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');

      src = fs.readFileSync(config.src + '/' + name + '.fs', 'ascii');
      Shaders[name].fragment = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
    }

    fs.writeFileSync(config.dest, 'var Shaders = '+ JSON.stringify(Shaders) +';\n');
  });

  grunt.registerMultiTask('clean', 'Clean up', function() {
    var fs = require('fs');
    try {
      fs.unlinkSync('dist/'+ grunt.config.data.pkg.name +'.pack.js');
    } catch (ex) {}
  });

  grunt.registerTask('default', 'Development build', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('copy');
    grunt.task.run('shaders');
    grunt.task.run('concat');
    grunt.task.run('uglify');
  });

  grunt.registerTask('release', 'Release', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('jshint');
    grunt.task.run('default');
    grunt.task.run('webpack');
    grunt.task.run('clean');
  });
};
