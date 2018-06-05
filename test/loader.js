
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

function toVar (content) {
  return content.replace(/ *[\r\n]+ */g, '\n');
}

function loadShaders (config) {
  const Shaders = {};
  config.forEach(name => {
    Shaders[name] = {
      vertex: toVar(loadFile(`${baseURL}/src/shader/${name}.vs`)),
      fragment: toVar(loadFile(`${baseURL}/src/shader/${name}.fs`))
    };
  });

  console.log('Shaders', Shaders);
  return `const Shaders = ${JSON.stringify(Shaders)};\n\n`;
}

//*****************************************************************************

const config = JSON.parse(loadFile(`${baseURL}/config.json`));
let js = '';
js += "(function() {";

// modules
config.modules.forEach(module => {
  js += loadFile(`${baseURL}/${module}\n`);
});

// shaders
js += loadShaders(config.shaders);

// worker
let workerStr = '';
config.worker.forEach(worker => {
  workerStr += loadFile(`${baseURL}/${worker}\n`);
});
js += `const workerStr = '${workerStr.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/ *[\r\n]+ */g, '\\n')}';`;

// OSMB core
config.src.forEach(name => {
  js += loadFile(`${baseURL}/${name}\n`);
});

js += "}());";

try {
  eval(js);
} catch (ex) {
  console.error(ex);
}
