var fs = require('fs');
var uglify = require('uglify-js');

module.exports = function(inputPath, outputPath) {
  var result = uglify.minify(inputPath, {
    mangle: true,
    compress: {
      unsafe: true
    },
    output: {
      comments: /^!/
    }
  });

  fs.writeFile(outputPath, result.code);
};
