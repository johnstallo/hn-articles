var os = require('os');
var request = require('request');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var _ = require('lodash');

var express = require('express');
var app = express();
var server = require('http').Server(app);


// application -------------------------------------------------------------
app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

app.use(function(req, res, next) {
    console.log("Sending response from: " + os.hostname());
    res.setHeader('Host-Name', os.hostname());
    return next();
});

var articles = [
    { _id: 0, url: "http://playground.tensorflow.org/", title: "Tinker with a Neural Network in Your Browser", votes: 0 },
    { _id: 1, url: "http://paulgraham.com/pgh.html", title: "How to Make Pittsburgh a Startup Hub", votes: 0 },
    { _id: 2, url: "http://www.nytimes.com/2016/04/13/science/alpha-centauri-breakthrough-starshot-yuri-milner-stephen-hawking.html?mabReward=A6&moduleDetail=recommendations-2&action=click&contentCollection=Americas&region=Footer&module=WhatsNext&version=WhatsNext&contentID=WhatsNext&src=recg&pgtype=article", title: "A Visionary Project Aims for Alpha Centauri", votes: 0 },
    { _id: 3, url: "https://code.facebook.com/posts/1755691291326688/introducing-facebook-surround-360-an-open-high-quality-3d-360-video-capture-system", title: "Continuous Deployment at Instagram", votes: 0 },
];

// api ---------------------------------------------------------------------
app.get('/api/articles/:id', function(req, res) {
    var articleID = req.params.id;
    res.send(articles[articleID]);
});

app.get('/api/articles', function(req, res) {
    res.send(articles);
});

var commentsServiceUrl = process.env.COMMENTS_MASTER_URL;

app.get('/api/articles/:id/comments', function(req, res) {
    var articleID = req.params.id;
    
    request(commentsServiceUrl + '/api/articles/' + articleID + '/comments', function(error, response, body) {    
        res.send(body);
    });
});

app.post('/api/upvote', function(req, res) {
    var articleID = req.body.articleID;
    articles[articleID].votes++;
    console.log("upvoted article: id=" + articleID + ", votes = " + articles[articleID].votes);
    res.send(articles);
});

app.post('/api/submit', function(req, res) {
    console.log("received submit request: %j", req);

    //TODO: validate new article

    var articleToAdd = {
        title: req.body.title,
        url: req.body.url,
        votes: 0,
        _id: articles.length + 1
    };

    console.log("created new article: %j", articleToAdd);

    articles.push(articleToAdd);

    console.log("updated articles: %j", articles);
    res.send(articles);
});

// create article and send back all articles after creation
app.post('/api/articles', function(req, res) {

    // create a article, information comes from AJAX request from Angular
    Article.create({
        text: req.body.text,
        done: false
    }, function(err, article) {
        if (err)
            res.send(err);

        // get and return all the articles after you create another
        getArticles(res);
    });

});

// delete an article
app.delete('/api/articles/:article_id', function(req, res) {
    Article.remove({
        _id: req.params.article_id
    }, function(err, article) {
        if (err)
            res.send(err);

        getArticles(res);
    });
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(process.env.PORT || 4000, function() {
    console.log('server up and running at 4000 port');
});