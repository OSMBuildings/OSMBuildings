
var baseURL = baseURL || './';

function loadFile(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send(null);

  var s = xhr.status;
  if (s !== 0 && s !== 200 && s !== 1223) {
    var err = Error(xhr.status +' failed to load '+ url);
    err.status = xhr.status;
    err.responseText = xhr.responseText;
    throw err;
  }

  return xhr.responseText;
}

function loadShaders(config) {
  var shader, type;
  var i, types = ['vertex', 'fragment'];
  var src, SHADERS = {};

  for (var name in config) {
    shader = config[name];

    SHADERS[name] = {
      src: {},
      attributes: shader.attributes,
      uniforms: shader.uniforms,
      frameBuffer: shader.frameBuffer
    };

    for (i = 0; i < types.length; i++) {
      type = types[i];
      src = loadFile(baseURL +'src/shaders/'+ name +'.'+ type +'.glsl');
      SHADERS[name].src[type] = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
    }
  }

  console.log('SHADERS', SHADERS);
  return 'var SHADERS = '+ JSON.stringify(SHADERS) +';\n';
}

var config = JSON.parse(loadFile(baseURL +'config.json'));

var file, str, js = '';
var global = this;

for (var i = 0; i < config.lib.length; i++) {
  js += loadFile(baseURL + config.lib[i]) +'\n\n';
}

for (var i = 0; i < config.src.length; i++) {
  file = config.src[i];

  if (file === 'src/shaders.js') {
    str = loadShaders(config.shaders);
  } else {
    str = loadFile(baseURL + file);
  }

  js += '//****** file: '+ file +' ******\n\n';
  js += str +'\n\n';
}

try {
  eval(js);
} catch (ex) {
  console.error(ex);
}
