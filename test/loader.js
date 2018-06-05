
const baseURL = '..';

//*****************************************************************************

function loadFile (url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send(null);

  const s = xhr.status;
  if (s !== 0 && s !== 200 && s !== 1223) {
    const err = Error(`{xhr.status} failed to load ${url}`);
    err.status = xhr.status;
    err.responseText = xhr.responseText;
    throw err;
  }

  return xhr.responseText;
}

function loadShaders (config) {
  const Shaders = {};
  config.forEach(name => {
    let src;
    Shaders[name] = {};

    src = loadFile(`${baseURL}/src/shader/${name}.vs`);
    Shaders[name].vertex = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');

    src = loadFile(`${baseURL}/src/shader/${name}.fs`);
    Shaders[name].fragment = src.replace(/'/g, "\'").replace(/[\r\n]+/g, '\n');
  });

  console.log('Shaders', Shaders);
  return `var Shaders = ${JSON.stringify(Shaders)};\n`;
}

//*****************************************************************************

const config = JSON.parse(loadFile(`${baseURL}/config.json`));
let js = '';
js += "(function() {";

// modules
config.modules.forEach(module => {
  js += loadFile(`${baseURL}/${module}\n`;
});

// shaders
js += loadShaders(config.shaders);

// OSMB core
config.src.forEach(name => {
  js += loadFile(`${baseURL}/${name}\n`;
});

js += "}());";

try {
  eval(js);
} catch (ex) {
  console.error(ex);
}
