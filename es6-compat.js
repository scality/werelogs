require('babel-core/register')({
    // Please list all paths to ES6-syntaxed code here.
    ignore: filename =>
        !(filename.startsWith(__dirname + '/lib/')
          || filename.startsWith(__dirname + '/test/')),
});
