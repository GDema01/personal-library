/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {   
      app.route('/api/books')
        .get(function (req, res){
          //response will be array of book objects
          //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            db.collection('books').find().toArray((err, data) => {
              for(let obj in data) {
                data[obj] = {
                  _id: data[obj]._id,
                  title: data[obj].title,
                  commentcount: data[obj].comments.length
                }
              }
              res.json(data);
            })
          });
        })

        .post(function (req, res){
          var title = req.body.title;
          //response will contain new book object including atleast _id and title
          if(!title) { res.send('missing title'); }
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            
            db.collection('books').insertOne({title: title, comments: []}, (err, data) => {
              res.json(data.ops[0])
            })
          });
        })
                              

        .delete(function(req, res){
          //if successful response will be 'complete delete successful'
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            
            db.collection('books').deleteMany({}, (err, data) => {
              if (err) return res.send(err);
              res.send('complete delete successful');
            })
          })
        });



      app.route('/api/books/:id')
        .get(function (req, res){
          var bookid = req.params.id;
          //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            
            db.collection('books').findOne({_id: new ObjectId(bookid)}, (err, data) => {
              if (err) return res.send(err);
              if (!data) return res.send('no book exists');
              res.json(data)
            })
          });
        })

        .post(function(req, res){
          var bookid = req.params.id;
          var comment = req.body.comment;
          //json res format same as .get
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            
            db.collection('books').findOneAndUpdate({_id: new ObjectId(bookid)}, {$push: {comments: comment}}, {returnOriginal: false}, (err, data) => {
              res.json(data);
            })
          });
        })

        .delete(function(req, res){
          var bookid = req.params.id;
          //if successful response will be 'delete successful'
          MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
            if (err) return console.log(err);
            let db = database.db('fccdatabase');
            
            db.collection('books').findOneAndDelete({_id: new ObjectId(bookid)}, (err, data) => {
              if (err) return res.send('could not delete');
              res.send('delete successful');
            })
          });
        });

};
