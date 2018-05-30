
module.exports = grunt => {

  const fs = require('fs');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    cfg: grunt.file.readJSON('config.json'),

    concat: {
      osmb: {
        options: {
          separator: "\n",
          banner: "(function() {",
          footer: "}());"
        },
        src: [
          '<%=cfg.modules%>',
          'build/temp/Shaders.js',
          // 'build/temp/GLX.debug.js',
          'build/temp/worker.var.js',
          '<%=cfg.glx%>',
          '<%=cfg.src%>'
        ],
        dest: 'dist/OSMBuildings/<%=pkg.name%>.debug.js'
      },

      // glx: {
      //   options: {
      //     separator: "\n",
      //     banner: "var GLX = (function() {",
      //     footer: "\nreturn GLX;\n}());\n",
      //     sourceMap: false
      //   },
      //   src: '<%=cfg.glx%>',
      //   dest: 'build/temp/GLX.debug.js'
      // },

      worker: {
        options: {
          separator: "\n"
        },
        src: '<%=cfg.worker%>',
        dest: 'build/temp/worker.debug.js'
      }
    },

    copy: {
      css: {
        src: 'src/style.css',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.css'
      }
    },

    uglify: {
      osmb: {
        options: {
          sourceMap: false
        },
        src: 'dist/OSMBuildings/<%=pkg.name%>.debug.js',
        dest: 'dist/OSMBuildings/<%=pkg.name%>.js'
      },

      worker: {
        options: {
          sourceMap: false
        },
        src: 'build/temp/worker.debug.js',
        dest: 'build/temp/worker.js'
      }
    },

    shaders: {
      src: 'src/shader',
      dest: 'build/temp/Shaders.js',
      names: '<%=cfg.shaders%>'
    },

    replace: {
      src: './dist/OSMBuildings/<%=pkg.name%>.debug.js',
      mapping: {
        '{{VERSION}}': '<%=pkg.version%>'
      }
    },

    eslint: {
      osmb: {
        options: {
          configFile: 'eslint.json',
          rulePaths: []
        },
        src: ['build/temp/GLX.debug.js']
      },

      // glx: {
      //   options: { esnext: true },
      //   src: ['build/temp/GLX.debug.js']
      // },

      worker: {
        options: {
          configFile: 'eslint.json',
          rulePaths: []
        },
        src: ['build/temp/worker.debug.js']
      },
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

  //***************************************************************************

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  //***************************************************************************

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

  function fileToVar (file, encoding = 'utf8') {
    const content = fs.readFileSync(file, encoding);
    return content.replace(/'/g, "\'").replace(/ +/g, ' ').replace(/ *[\r\n]+ */g, '\n');
  }

  grunt.registerTask('worker', () => {
    const config = grunt.config.get('worker');

    setup();

    grunt.task.run('concat:worker');

    // grunt.task.run('eslint:worker'); // TODO

    grunt.task.run('uglify:worker');

    const content = fileToVar('build/temp/worker.js'); // CONFIG

    fs.writeFileSync('build/temp/worker.var.js', `const worker = '${content}';\n`);
  });

  grunt.registerTask('shaders', () => {
    const config = grunt.config.get('shaders');

    setup();

    const shaders = {};
    config.names.forEach(name => {
      shaders[name] = {};

      // const vertexSrc = fs.readFileSync(config.src + '/' + name + '.vs', 'ascii');
      // shaders[name].vertex = vertexSrc.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
      shaders[name].vertex = fileToVar(config.src + '/' + name + '.vs', 'ascii');

      // const fragmentSrc = fs.readFileSync(config.src + '/' + name + '.fs', 'ascii');
      // shaders[name].fragment = fragmentSrc.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
      shaders[name].fragment = fileToVar(config.src + '/' + name + '.fs', 'ascii');
    });

    fs.writeFileSync(config.dest, `const Shaders = ${JSON.stringify(shaders)};\n`);
  });

  // grunt.registerTask('glx', 'build GL tools', function() {
  //   setup();
  //   grunt.task.run('concat:glx');
  //   grunt.task.run('eslint:glx');
  // });

  grunt.registerTask('replace', () => {
    const config = grunt.config.get('replace');

    setup();

    let content = '' + fs.readFileSync(config.src);
    for (let tag in config.mapping) {
      content = content.replace(tag, config.mapping[tag]);
    }

    fs.writeFileSync(config.src, content);
  });

  grunt.registerTask('default', 'core OSM Buildings task', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');

    setup();

    grunt.task.run('shaders');

    // grunt.task.run('glx');

    grunt.task.run('worker');

    grunt.task.run('eslint:osmb');

    grunt.task.run('concat:osmb');

    grunt.task.run('replace');

    grunt.task.run('uglify:osmb');

    grunt.task.run('copy:css');

    grunt.task.run('compress'); // zip a release bundle
  });
};
