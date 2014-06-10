var services = require('./services.json');
var fs = require('fs');
var tmpl = "./tmpl/sentinel.tmpl.conf";
var outputDir = "./output/";

var targetServer;
var createAll = false; 
if(2 === process.argv.length){
	createAll = true;
}else if(3 === process.argv.length){
	targetServer = process.argv[2]
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

var sentinels = services.redis.sentinels;

var read_stream = fs.createReadStream(tmpl);
read_stream
	.on('data',  function (data){
		console.log('read: data');
		for(var i in sentinels){
			var sentinel = sentinels[i];
			if(createAll || targetServer === services.server[sentinel.server]){
				var cfg = createConf(data, sentinel);
				var outputFile = outputDir + 'sentinel.'+services.server[sentinel.server]
								+'_'+sentinel.port+'.cfg');
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
