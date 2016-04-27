
var fs = require('fs');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    cfg: grunt.file.readJSON('config.json'),

    concat: {
      glx: {
        options: {
          separator: "\n",
          banner: "var GLX = (function() {",
          footer: "\nreturn GLX;\n}());\n",
          sourceMap: true
        },
        src:'<%=cfg.glx%>',
        dest: 'build/temp/GLX.debug.js'
      },

      'basemap': {
        options: {
          separator: "\n",
          banner: "var Basemap = (function() {\n",
          footer: "\nreturn Basemap;\n}());\nvar GLMap = Basemap;\n",
          sourceMap: true
        },
        src:'<%=cfg.basemap%>',
        dest: 'build/temp/Basemap.debug.js'
      },

      'osmb-with-basemap': {
        options: {
          separator: "\n",
          banner: "(function(global) {",
          footer: "}(this));",
          sourceMap: true
        },
        src: [
          '<%=cfg.modules%>',
          'build/temp/Shaders.js',
          'build/temp/GLX.debug.js',
          'build/temp/Basemap.debug.js',
          '<%=cfg.src%>'
        ],
        dest: 'dist/OSMBuildings/<%=pkg.name%>.debug.js'
      }
    },

    copy: {
      'assets': {
        src: 'src/skydome.jpg',
        dest: 'dist/OSMBuildings/skydome.jpg'
      },
      'css': {
        src: 'src/engines/Basemap/style.css',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.css'
      }
    },

    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        src: 'dist/OSMBuildings/<%=pkg.name%>.debug.js',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.js'
      }
    },

    shaders: {
      dist: {
        src: 'src/shader',
        dest: 'build/temp/Shaders.js',
        names: '<%=cfg.shaders%>'
      }
    },

    version: {
      dist: {
        src: './dist/OSMBuildings/<%=pkg.name%>.debug.js',
        mapping: {
          '{{VERSION}}': '<%=pkg.version%>'
        }
      }
    },

    jshint: {
      glx: {
        options: {},
        src: ['build/temp/GLX.debug.js']
      },

      basemap: {
        options: {},
        src: ['build/temp/Basemap.debug.js']
      },

      osmb: {
        options: {},
        src: '<%=cfg.src%>'
      }
    },

    compress: {
      main: {
        options: {
          level: 5,
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>.zip'
        },
        files: [
          { expand: true, cwd: 'dist/', src: ['<%=pkg.name%>/*', 'index.html'] }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerMultiTask('shaders', 'Build shaders', function() {
    //grunt.log.writeln(JSON.stringify(this.data));
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

  grunt.registerTask('glx', 'GL abstraction layer for OSM Buildings', function() {
    grunt.task.run('concat:glx');
    grunt.task.run('jshint:glx');
  });

  grunt.registerTask('basemap', 'base map for standalone OSM Buildings', function() {
    grunt.task.run('concat:basemap');
    grunt.task.run('jshint:basemap');
  });

  grunt.registerMultiTask('version', 'set version number', function() {
    //grunt.log.writeln(JSON.stringify(this.data));
    var config = this.data;

    var content = '' + fs.readFileSync(config.src);

    for (var tag in config.mapping) {
      content = content.replace(tag, config.mapping[tag]);
    }

    fs.writeFileSync(config.src, content);
  });

  grunt.registerTask('osmb', 'core OSM Buildings task', function() {
    grunt.task.run('shaders');
    grunt.task.run('glx');
    grunt.task.run('basemap');

    grunt.task.run('jshint:osmb');

    grunt.task.run('concat:osmb-with-basemap');

    grunt.task.run('version');

    grunt.task.run('uglify');
  });

  grunt.registerTask('default', 'dev build', function() {
    grunt.task.run('shaders');
  });

  grunt.registerTask('release', 'Release', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');

    grunt.task.run('osmb');

    grunt.task.run('copy:assets');
    grunt.task.run('copy:css');

    grunt.task.run('compress'); // zip a release bundle
  });
};
