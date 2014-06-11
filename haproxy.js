var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/haproxy.cfg";
var confDir = setting.services["haproxy"].dirs["conf"];

var getOutputFiles = function(){
	var files = [];
	for (var serverId in services.server){
		var server = services.server[serverId];
		files.push(setting.output.dir+"/"+server+confDir+"/haproxy.cfg");
	}
	return files;
}


var redis_services_str = "";
var redis_services =
	new Array(services.redis.backend.master)
			.concat(services.redis.backend.slaves);
for(var i in redis_services){
	var redis_service = redis_services[i];
	redis_services_str += 
		"server "
		+redis_service.name
		+" "
		+services.server[redis_service.server]
		+":"
		+redis_service.port
		+" check inter 1s\n"
		;
}

var read_stream = fs.createReadStream(tmpl);

var cfg = "";
read_stream
	.on('data',  function (data){
		console.log('read: data');
		cfg = data.toString().replace(/<services>/g, redis_services_str);
		var outputFiles = getOutputFiles();
		for(var i in outputFiles){
			var outputFile = outputFiles[i];
			var write_stream= fs.createWriteStream(outputFile);
			write_stream
				.on('drain', function (){ console.log('write: drain'); })
				.on('error', function (exeption){ console.log('write: error'); })
				.on('close', function (){ console.log('write: colse'); })
				.on('pipe',  function (src){ console.log('write: pipe');  });
			write_stream.write(cfg);
			write_stream.end();
		}



	})
	.on('end',   function (){ console.log('read: end');   })
	.on('error', function (exception){ console.log('read: error'); })
	.on('close', function (){ console.log('read: close'); });
