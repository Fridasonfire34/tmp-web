const fs = require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);


const withTM = require('next-transpile-modules')(['@mui/icons-material']);

module.exports = withTM({
  // your Next.js config
});
