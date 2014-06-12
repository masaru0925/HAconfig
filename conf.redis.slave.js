var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.conf";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, slave) {
	return data.toString()
		.replace(/<conf\.name>/g, setting.services.redis.conf)
		.replace(/<pid\.name>/g, setting.services.redis.pid)
		.replace(/<log\.name>/g, setting.services.redis.log)
		.replace(/<redis\.dir\.log>/g, setting.services.redis.dirs.log)
		.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
		.replace(/<redis\.dir\.lib>/g, setting.services.redis.dirs.lib)
		.replace(/<redis\.name>/g, slave.name)
		.replace(/<redis\.port>/g, slave.port)
		.replace(/<master\.server>/g, services.server[services.redis.backend.master.server])
		.replace(/<master\.port>/g, services.redis.backend.master.port)
		.replace(/<slave>/g, "")
		;
}

readStream
	.on('data',  function (data){
		console.log('read: data');
		for(var i in services.redis.backend.slaves){
			var slave = services.redis.backend.slaves[i];
			var cfg = createConf(data, slave);
			var outputFile =
				 setting.output.dir
				+'/'+services.server[slave.server]
				+setting.services.redis.dirs.conf
				+'/'+setting.services.redis.conf
				.replace(/<redis\.name>/g, slave.name)
				.replace(/<redis\.port>/g, slave.port)
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
