
const baseURL = '..';

//*****************************************************************************

function toVar (content) {
  return content.replace(/ *[\r\n]+ */g, '\n');
}

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

//*****************************************************************************

function loadModules (config) {
  let str = '';
  config.forEach(file => {
    str += loadFile(`${baseURL}/${file}\n`);
  });

  return str;
}

//*****************************************************************************

function loadShaders (config) {
  let str = '';
  config.forEach(name => {
    str += `const ${name}Shader = ${JSON.stringify({
      name: name,
      vs: toVar(loadFile(`${baseURL}/src/shader/${name}.vs`)),
      fs: toVar(loadFile(`${baseURL}/src/shader/${name}.fs`))
    })}\n\n`;
  });

  return str;
}

//*****************************************************************************

function loadWorkers (config) {
  let str = '';
  for (let name in config) {
    let src = '';
    config[name].forEach(file => {
      src += loadFile(`${baseURL}/${file}\n`);
    });
    str += `const ${name}Worker = '${src.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/ *[\r\n]+ */g, '\\n')}';\n\n`;
  }

  return str;
}

//*****************************************************************************

const config = JSON.parse(loadFile(`${baseURL}/config.json`));
let js = '';
js += "(function() {";

js += loadModules(config.modules);
js += loadShaders(config.shaders);
js += loadWorkers(config.workers);

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
