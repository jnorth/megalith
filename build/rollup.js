var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var uglify = require('./uglify');
var pkg = require('../package.json');

var banner =
  '/*!\n' +
  ' * ' + pkg.name + ' v' + pkg.version + '\n' +
  ' * (c) 2016-' + new Date().getFullYear() + ' ' + pkg.author + '\n' +
  ' * Released under the MIT License.\n' +
  ' */'

rollup.rollup({
  entry: 'src/index.js',
  plugins: [ babel() ]
}).then(function(bundle){

  // Write ES module bundle
  bundle.write({
    format: 'es',
    dest: pkg.module,
    banner
  });

  // Write CommonJS bundle
  bundle.write({
    format: 'cjs',
    dest: pkg.main,
    banner
  });

  // Write UMD bundles
  bundle.write({
    format: 'umd',
    dest: pkg.browser,
    moduleName: pkg.name,
    banner
  }).then(function(){
    uglify(pkg.browser, pkg.browser.replace('.js', '.min.js'));
  }).catch(warn);

}).catch(warn);

function warn(error) {
  console.log(error.stack);
}
