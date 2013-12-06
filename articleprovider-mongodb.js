var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var lineReader = require('line-reader');

ArticleProvider = function(host, port) {
  this.db= new Db('graphTherapy', new Server(host, port, {auto_reconnect: true}, {}), {safe: false});
  this.db.open(function(){});
};


ArticleProvider.prototype.getCollection= function(callback) {
  this.db.collection('articles', function(error, article_collection) {
 
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

ArticleProvider.prototype.findAll = function(callback) {

    this.getCollection(function(error, article_collection) {

      if( error ) callback(error)
      else {
        article_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


ArticleProvider.prototype.save = function(articleNumber, callback) {
 // Create new Article and save it to the DB
 // var article = {title: '1', songs:[{artist:'Mat Zo', song:'Bipolar'}, 
 //                                 {artist:'Artificial', song:'Prototype'}]};
 var collection = null;

 this.getCollection(function(error, article_collection) {
    collection = article_collection;
    console.log('collection got');
  });


  // Instantiate empty objects to fill later
  var article = {title: null, songs:[]};
  article.title = 'Episode ' + articleNumber;
  var songs = [];
  var song = {artist: null, song: null};


  // Variables to keep track of parameter, and array index
  var i = 0;
  var j = 0;


  // Read file line-by-line and push songs onto the article
  lineReader.eachLine('./public/episodes/test' + articleNumber + '.txt', function(line) {
    // console.log(line);
    

    
    if(line.length == 0) {

      //Push the song onto the songs array
      console.log(song.artist + ' ' + song.song);
      article.songs[j] = song;
      song = {artist: null, song: null};
      
      // Increment line number
      i++;
      // Increment song number
      j++;

    }

    // This logic assumes that the textfile has been formatted as such:
    /*
      * artist name
      * song name 
      * [blank line]
      * artistname
      * song name
      * [blank line]
      * .
      * .
      * .
      * artist name
      * song name
      * [blank line]    <--blank line at the end is important
    */

    else {
      if( i % 3 == 0)
        song.artist = line;
      else if( i % 3 == 1)
        song.song = line;
      else
        console.log('********\n\n\n\n\nTextfile formatted improperly!!!!\n\n\n\n\n**********');

    // increment line number
    i++;      
    }
  }).then( function () {
    // Insert article into the DB
    
    // console.log(article.songs);

    collection.insert(article, function( error ) {
      console.log("article inserted");
      if( error ) callback( error );
      else {
        console.log('callback for save function');
        callback(null);
      }

    });
  });  
};


ArticleProvider.prototype.addSongToArticle = function(articleId, artist, song_title, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {songs: song}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};


exports.ArticleProvider = ArticleProvider;