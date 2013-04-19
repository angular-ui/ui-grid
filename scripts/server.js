var express = require('express');
var app = express();

var staticDir = __dirname + '/..';

var sleepMap = {
  '/workbench/templating/external_row_template.html': 250,
  '/workbench/templating/data.json': 0
};

var sleeper = function(req, res, next) {
    if (sleepMap[req.path] !== undefined) {;
      // sleep(sleepMap[req.path]);
      setTimeout(function() {
        next();
      }, sleepMap[req.path]);
    }
    else {
      next(); // Passing the request to the next handler in the stack.
    }
};

app.use(sleeper);
app.use(express.static(staticDir));

app.get('/data_response', function(req, res, next) {
  setTimeout(function(){
    res.json(
      [{ "name": "Moroni",  "age": 50, "id": 101 },
       { "name": "Tiancum", "age": 43, "id": 102 },
       { "name": "Jacob",   "age": 27, "id": 103 },
       { "name": "Nephi",   "age": 29, "id": 104 },
       { "name": "Enos",    "age": 34, "id": 105 }]
    );
  }, 0);
});

var port = 8000;
app.listen(port);
console.log('Listening on port ' + port);

// function sleep(ms) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 10000000; i++) {
//     if ((new Date().getTime() - start) > ms){
//       break;
//     }
//   }
// };