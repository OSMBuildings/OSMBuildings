
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: "\n",
        banner: "(function(global) {",
        footer: "}(this));",
        sourceMap: true
      },
      glx: {
        src: [
          "src/glx/index.js",
          "src/glx/prefix.js",
          "src/glx/util.js",
          "src/glx/Buffer.js",
          "src/glx/Framebuffer.js",
          "src/glx/Shader.js",
          "src/glx/Matrix.js",
          "src/glx/Texture.js",
          "src/glx/texture/index.js",
          "src/glx/texture/Image.js",
          "src/glx/texture/Data.js",
          "src/glx/mesh/index.js",
          "src/glx/mesh/Triangle.js",
          "src/glx/mesh/Plane.js",
          "src/glx/mesh/Cube.js",
          "src/glx/suffix.js"
        ],
        dest: 'lib/GLX.debug.js'
      },
      core: {
        src: [grunt.file.readJSON('config.json').lib, grunt.file.readJSON('config.json').src],
        dest: 'dist/OSMBuildings/<%=pkg.name%>.debug.js'
      },
      basemap: {
        src: ['engines/Basemap/index.js', 'engines/Basemap/Pointer.js', 'engines/Basemap/Layers.js'],
        dest: 'dist/GLMap/GLMap.debug.js'
      }
    },

    copy: {
      'core-assets': {
        src: 'src/skydome.jpg',
        dest: 'dist/OSMBuildings/skydome.jpg'
      },
      'basemap-css': {
        src: ['engines/Basemap/style.css'],
        dest: 'dist/GLMap/GLMap.css'
      }
    },

    uglify: {
      options: {
        sourceMap: true
      },
      core: {
        src: 'dist/OSMBuildings/<%=pkg.name%>.debug.js',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.js'
      },
      basemap: {
        src: 'dist/GLMap/GLMap.debug.js',
        dest: 'dist/GLMap/GLMap.js'
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-webpack');

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

  grunt.registerTask('basemap', ['concat:basemap', 'copy:basemap-css', 'uglify:basemap']);

  grunt.registerTask('default', 'Development build', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('shaders');
    grunt.task.run('concat:core');
    grunt.task.run('uglify:core');
  });

  grunt.registerTask('release', 'Release', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');

    grunt.task.run('concat:glx');
    grunt.task.run('basemap');

    grunt.task.run('copy:core-assets');
    grunt.task.run('jshint');
    grunt.task.run('default');
    grunt.task.run('webpack');
    grunt.task.run('clean');
  });
};
