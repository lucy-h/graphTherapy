// Uses functions in articleprovider-mongodb.js
var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

// module.exports is the object that's returned as the result of the 'require' call
var app = module.exports = express();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

/*  SEPERATE CONFIGS FOR DEV & PROD ENVIRONMENTS */

// Dev Env - for debugging
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Prod Env
app.configure('production', function(){
  app.use(express.errorHandler());
});

// Instantiate instance of ArticleProvider, passing it a host and port #
var articleProvider = new ArticleProvider('localhost', 27017);

/* ROUTES *///

// Home
app.get('/', function(req, res){
  //When we recieve GET request for URI: '/', find all documents and send them as the response
  articleProvider.findAll(function(error, docs){
      // res.render() is the callback for findAll
      res.render('index.jade', {  
        title: 'Blog',
        articles: docs
        
      });
  })
});

// Render Blog Post Page
app.get('/blog/new', function(req, res) {
  res.render('blog_new.jade',
    {title: 'New Post'
    }
  );
});

// Submit new entry and redirect to home
app.post('/blog/new', function(req, res) {
  // When user saves their post, call the save function, passing it the text 
  // from the title and body form
  console.log("HIT THE FUCNTION");
  articleProvider.save({
    title: req.param('title'),
    body: req.param('body')
  }, function( error, docs) {
    res.redirect('/')
  });
});

// Show single blog entry
app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade',
        {
          title: article.title,
          article:article
        }
        );
    });
});

// Submit comment and redirect to 
app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

// Listen on port 3000!!!
app.listen(3000);
console.log("Express server listening on port %d in %s mode", 3000, app.get('env') );