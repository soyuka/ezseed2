var console = require(global.conf.root + '/core/logger');
var fs = require('fs')
	, _ = require('underscore')
	, db = require('../core/database');

var streaming = {
	watch : function(req, res) {

		db.files.movies.byId(req.params.id, function(err, doc) {
			if(err) { 
				console.log('error', err);
				req.session.error = 'Aucun fichier trouvé';
				res.redirect('/');
			} else {

				var file;
				if(req.params.fid === undefined)
					file = doc.videos[0];
				else
					file = db.file.byId(doc, req.params.fid);
				
				path = file.path;

				doc.episode = file.episode;

				//current working dir
				var cwd = global.conf.root.replace('/app', '');

				path = path.replace(cwd, '').replace(global.conf.path, '/downloads');

				var fullUrl = 'http://' + req.host + path;

				if(doc.movieType == 'tvseries')
					res.render('watch', { title: 'Ezseed V2 - ' + doc.title , movie: doc, path: path, fullUrl: fullUrl, id:req.params.id, season : true  });
				else
					res.render('watch', { title: 'Ezseed V2 - ' + doc.title , movie: doc, path: path, fullUrl: fullUrl, id:req.params.id, season: null  });
				
			}
			
		});

	},
	//That's now a plugin, to be removed
	listen : function(req, res) {
		if(req.xhr) {
			if(req.params.id) {
				db.files.albums.byId(req.params.id, function(err, doc) {
					if(err) { 
						console.log(err);
						res.json({error : 'Aucun fichier trouvé'});
					} else {

						var cwd = global.conf.root.replace('/app', '');

						for(var i in doc.songs)			
							 doc.songs[i].url = 'http://' + req.host + doc.songs[i].path.replace(cwd, '').replace(global.conf.path, '/downloads');
						

						res.json( { album: doc, id:doc._id });
						
					}
					
				});
			} else {
				res.send(404, {});
			}
		}

	}
};


module.exports = function(app) {
	app.get('/watch/:id/:fid?', streaming.watch);
	//app.get('/watch/(:id)/(:fid)', streaming.watch);
	// app.get('/stream/(:id)', streaming.stream);
	//app.get('/listen/(:id)', streaming.listen);
};