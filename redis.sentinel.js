var services = require('./services.json');
var fs = require('fs');
var mkdirp = require('mkdip');
var tmpl = "./tmpl/redis.sentinel.conf";
var outputDir = "./output/";

var sentinels = services.redis.sentinels;
var read_stream = fs.createReadStream(tmpl);
var targetServer;
var createAll = false; 

var usageError = function(){
	var scriptPaths = process.argv[1].split("\\");

	console.log(process.argv[0]+" "+scriptPaths[scriptPaths.length-1]+" [target server(Name or ip-address)]");
	process.exit(1);
}


if(2 === process.argv.length){
	createAll = true;
}else if(3 === process.argv.length){
	targetServer = process.argv[2];
}else{
	usageError();
}



var createConf = function(data, sentinel) {
	return data.toString()
		.replace(/<sentinel\.port>/g, sentinel.port)
		.replace(/<master\.name>/g, services.redis.backend.master.name)
		.replace(/<master\.server>/g,
								services.server[services.redis.backend.master.server])
		.replace(/<master\.port>/g, services.redis.backend.master.port)
		.replace(/<quorum>/g, services.redis.sentinels.length-1);
}

read_stream
	.on('data',  function (data){
		console.log('read: data');
		for(var i in sentinels){
			var sentinel = sentinels[i];
			if(createAll || targetServer === services.server[sentinel.server]){
				var cfg = createConf(data, sentinel);
				mkdirp(outputDir+services.server[sentinel.server], function(err){
					if(err){
						console.error(err);
					}else{
					}
				});
				var outputFile = outputDir + 'sentinel.'+sentinel.port+'.conf';
				var write_stream= fs.createWriteStream(outputFile);
				write_stream
					.on('drain', function (){ console.log('write: drain'); })
					.on('error', function (exeption){ console.log('write: error'); })
					.on('close', function (){ console.log('write: colse'); })
					.on('pipe',  function (src){ console.log('write: pipe');  });
				write_stream.write(cfg);
				write_stream.end();
			}
		}
	})
	.on('end',   function (){ console.log('read: end');   })
	.on('error', function (exception){ console.log('read: error'); })
	.on('close', function (){ console.log('read: close'); });
