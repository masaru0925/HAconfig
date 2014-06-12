var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.sentinel.conf";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, sentinel) {
	return data.toString()
		.replace(/<conf\.name>/g, setting.services.redis.conf)
		.replace(/<pid\.name>/g, setting.services.redis.pid)
		.replace(/<log\.name>/g, setting.services.redis.log)
		.replace(/<redis\.dir\.log>/g, setting.services.redis.dirs.log)
		.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
		.replace(/<sentinel\.port>/g, sentinel.port)
		.replace(/<master\.name>/g, services.redis.backend.master.name)
		.replace(/<master\.server>/g,
				services.server[services.redis.backend.master.server])
		.replace(/<master\.port>/g, services.redis.backend.master.port)
		.replace(/<quorum>/g, services.redis.sentinels.length-1)
		;
}

readStream
	.on('data',  function (data){
		console.log('read: data');
		for(var i in services.redis.sentinels){
			var sentinel = services.redis.sentinels[i];
			var cfg = createConf(data, sentinel);
			var outputFile =
				 setting.output.dir
				+'/'+services.server[sentinel.server]
				+setting.services.redis.dirs.conf
				+'/'+setting.services.redis.conf
				.replace(/<redis\.name>/g, sentinel.name)
				.replace(/<redis\.port>/g, sentinel.port)
				;

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
