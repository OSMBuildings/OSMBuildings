
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
        src: '<%=cfg.glx%>',
        dest: 'build/temp/GLX.debug.js'
      },

      'osmb-standalone': {
        options: {
          separator: "\n",
          banner: "(function() {",
          footer: "}());",
          sourceMap: true
        },
        src: [
          '<%=cfg.modules%>',
          'build/temp/Shaders.js',
          'build/temp/GLX.debug.js',
          '<%=cfg.src%>'
        ],
        dest: 'dist/OSMBuildings/<%=pkg.name%>.debug.js'
      }
    },

    copy: {
      'css': {
        src: 'src/style.css',
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
        options: { esnext: true },
        src: ['build/temp/GLX.debug.js']
      },

      osmb: {
        options: { esnext: true },
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
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  function safeMkdir(dir) {
    try {
      fs.readdirSync(dir);
    } catch (ex) {
      fs.mkdirSync(dir);
      grunt.log.writeln('directory created: ' + dir);
    }
  }

  function setup() {
    safeMkdir('dist');
    safeMkdir('dist/OSMBuildings');
    safeMkdir('build');
    safeMkdir('build/temp');
  }

  grunt.registerMultiTask('shaders', 'Build shaders', function() {
    setup();

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
    setup();
    grunt.task.run('concat:glx');
    grunt.task.run('jshint:glx');
  });

  grunt.registerMultiTask('version', 'set version number', function() {
    setup();
    //grunt.log.writeln(JSON.stringify(this.data));
    var config = this.data;

    var content = '' + fs.readFileSync(config.src);

    for (var tag in config.mapping) {
      content = content.replace(tag, config.mapping[tag]);
    }

    fs.writeFileSync(config.src, content);
  });

  grunt.registerTask('osmb', 'core OSM Buildings task', function() {
    setup();
    grunt.task.run('shaders');
    grunt.task.run('glx');

    grunt.task.run('jshint:osmb');

    grunt.task.run('concat:osmb-standalone');

    grunt.task.run('version');

    grunt.task.run('uglify');
  });

  grunt.registerTask('default', 'dev build', function() {
    setup();
    grunt.task.run('shaders');
  });

  grunt.registerTask('release', 'Release', function() {
    setup();
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');

    grunt.task.run('osmb');

    grunt.task.run('copy:css');

    grunt.task.run('compress'); // zip a release bundle
  });
};
