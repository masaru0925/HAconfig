var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/haproxy.cfg";
var confDir = setting.services.haproxy.dirs.conf;

var getOutputFiles = function(){
	var files = [];
	for (var serverId in services.server){
		var server = services.server[serverId];
		files.push(setting.output.dir+"/"+server+confDir+"/haproxy.cfg");
	}
	return files;
}


var redisServicesStr = "";
var redisServices =
	new Array(services.redis.backend.master)
			.concat(services.redis.backend.slaves);
for(var i in redisServices){
	var redisService = redisServices[i];
	redisServicesStr += 
		"server "
		+redisService.name
		+" "
		+services.server[redisService.server]
		+":"
		+redisService.port
		+" check inter 1s\n"
		;
}

var readStream = fs.createReadStream(tmpl);

var cfg = "";
readStream
	.on('data',  function (data){
		console.log('read: data');
		cfg = data.toString().replace(/<services>/g, redisServicesStr);
		var outputFiles = getOutputFiles();
		for(var i in outputFiles){
			var outputFile = outputFiles[i];
			var writeStream= fs.createWriteStream(outputFile);
			writeStream
				.on('drain', function (){ console.log('write: drain'); })
				.on('error', function (exeption){ console.log('write: error'); })
				.on('close', function (){ console.log('write: colse'); })
				.on('pipe',  function (src){ console.log('write: pipe');  });
			writeStream.write(cfg);
			writeStream.end();
		}



	})
	.on('end',   function (){ console.log('read: end');   })
	.on('error', function (exception){ console.log('read: error'); })
	.on('close', function (){ console.log('read: close'); });
