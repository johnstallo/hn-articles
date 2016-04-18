var os = require('os');
var request = require('request');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// api -------------------------------------------------------------
app.get('/api', function(req, res) {
    request(process.env.SERVICE_B_MASTER_URL, function(error, response, body) {
        res.send('Hello from service A running on ' + os.hostname() + ' and ' + body);
    });
});



// application -------------------------------------------------------------
app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
// app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
// app.use(bodyParser.json()); // parse application/json
// app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
// app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});
// io -------------------------------------------------------------

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('greet', function(times) {
        console.log("received greeting");
        
        if (times <= 0 || times > 100) {
            times = 1;
        }
        
        var i = 0;
        var stop = setInterval(function() {
            //var serviceToCall = process.env.SERVICE_B_MASTER_URL + getRandomInt(0, 0);
            var serviceToCall = process.env.SERVICE_B_MASTER_URL;
            request(serviceToCall, function(error, response, body) {
                io.emit('hello', {
                    message: body,
                    timestamp: Date.now()
                });
                console.log("emitted hello from " + serviceToCall + ", who said: " + body);
            });
            i++;
            if (i >= times) {
                clearInterval(stop);
            }
        }, 100);

    });
});

server.listen(process.env.PORT || 4000);

// var express = require('express');
// var app = express();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

// app.use(express.static(__dirname + '/public'));

// io.on('connection', function(socket) {
//   console.log('new connection');

//   socket.on('add-customer', function(customer) {
//     io.emit('notification', {
//       message: 'new customer',
//       customer: customer
//     });
//   });
// });

// server.listen(4000, function() {
//   console.log('server up and running at 4000 port');
// });