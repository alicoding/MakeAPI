var async = require( "async" );
var Habitat = require( "habitat" );

Habitat.load();

var config = new Habitat();

var Mongo = require( "../lib/mongoose" )();
var Make = require( "../lib/models/make" )( Mongo.mongoInstance() );

  var q = async.queue( function( doc, done ) {
    doc.index( done );
  }, 2);
  q.drain = function() {
    console.log( "Done indexing %d records from Mongo", indexedRecords );
    Mongo.mongoInstance().connection.close();
  };

  var indexedRecords = 0;
  var stream = Make.find({}).stream();
  stream.on( "data", function( doc ) {
    q.push( doc, function( err ) {
      if ( err ) {
        throw err;
      }

      indexedRecords++;
      if ( indexedRecords % 100 === 0 ) {
        console.log( "Indexed %d records", indexedRecords );
      }
    });
  });
  stream.on( "error", function ( err ) {
    throw err;
  });
  stream.on( "end", function() {
    console.log( "Done streaming records from Mongo" );
  });
