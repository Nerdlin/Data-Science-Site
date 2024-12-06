const fs = require('fs');
const uglifyJS = require('uglify-js');
const cssnano = require('cssnano');

const jsCode = fs.readFileSync('path/to/your.js', 'utf8');
const minifiedJS = uglifyJS.minify(jsCode).code;
fs.writeFileSync('path/to/your.min.js', minifiedJS);

const cssCode = fs.readFileSync('path/to/your.css', 'utf8');
cssnano.process(cssCode).then(result => {
  fs.writeFileSync('path/to/your.min.css', result.css);
});