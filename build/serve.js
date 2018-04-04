
// npm install connect serve-static

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic('../')).listen(8999, function(){
    console.log('Server running, browse to 127.0.0.1:8999 to view...');
});


