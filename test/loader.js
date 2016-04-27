
var baseURL = '../';

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
  var src, name, Shaders = {};

  for (var i = 0; i < config.length; i++) {
    name = config[i];

    Shaders[name] = {};

    src = loadFile(baseURL +'src/shader/'+ name +'.vs');
    Shaders[name].vertex = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');

    src = loadFile(baseURL +'src/shader/'+ name +'.fs');
    Shaders[name].fragment = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
  }

  console.log('Shaders', Shaders);
  return 'var Shaders = '+ JSON.stringify(Shaders) +';\n';
}

var config = JSON.parse(loadFile(baseURL +'config.json'));

var file, str, js = '';
var global = this;

for (var i = 0; i < config.modules.length; i++) {
  js += loadFile(baseURL + config.modules[i]) +'\n\n';
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
