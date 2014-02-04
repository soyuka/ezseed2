var _ = require('underscore')
  , async = require('async')
  , db = require('../core/database')
  , fs = require('fs');

//Remove 
var to_remove = [];

var exists = function(params, callback) {
	
	var item = params.item;

	if(!fs.existsSync(item.path)) {
		// global.log(0, 'Exists', type, item.path);
		// global.log(0, 'has been deleted', item);
		
		global.log(0, 'should be deleted');

		to_remove.push({
			type: params.type,
			item: params.file._id,
			file: params.item._id
		});

		switch(params.type) {
			case 'movies': 
				db.files[params.type].deleteVideo(params.file._id, item._id, function(err) {
					if(err)
						global.log('error', err);

					callback(null, item);
				});
				break;
			case 'albums':
				db.files[params.type].deleteSong(params.file._id, item._id, function(err) {
					if(err)
						global.log('error', err);

					callback(null, item);
				});
				break;

			case 'others':
				db.files[params.type].deleteFile(params.file._id, item._id, function(err) {
					if(err)
						global.log('error', err);

					callback(null, item);
				});
				break;
		}

		
	} else {
	
		callback(null, item);
	}

}

var find_missing = function(type, files, next) {

	async.map(files, function(file, done) {

		var paths = file.videos || file.songs || file.files
		  , file_type = file.videos ? 'videos' : file.songs ? 'songs' : 'files';

		if(paths.length)
			async.mapSeries(paths, function(path, callback) {

				exists(
					{
						type: type,
						item: path,
						file: file

					}, callback);

			}, function(err, exists) {

				//we need back our files <type>
				file[file_type] = exists;
				
				done(null, file);
			});
		else
			done(null, file);

	}, function(err, results) {
		next(err, _.flatten(results));
	});
}

var remove = function (existing, cb) {

	//Parallel on 3 types, find the missing ones
	async.parallel({
	    movies: function(callback){
	        find_missing('movies', existing.movies, callback);
	    },
	    albums: function(callback){
	        find_missing('albums', existing.albums, callback);
	    },
	    other: function(callback) {
	    	find_missing('others', existing.others, callback);
	    }
	},
	function(err, results) {
		global.log('debug','To be removed', to_remove);

		//Replacing original variables
		existing.movies = results.movies;
		existing.albums = results.albums;
		existing.others = results.others;

	    cb(null, existing);
	});

};

module.exports = remove;