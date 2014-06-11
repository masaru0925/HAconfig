var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.slave.conf";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, slave) {
	return data.toString()
		.replace(/<redis\.dir\.log>/g, setting.services["redis"].dirs["log"])
		.replace(/<redis\.dir\.pid>/g, setting.services["redis"].dirs["pid"])
		.replace(/<slave\.port>/g, slave.port)
		.replace(/<slave\.name>/g, slave.name)
		.replace(/<master\.server>/g, services.server[services.redis.backend.master.server])
		.replace(/<master\.port>/g, services.redis.backend.master.port)
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
				+"/"+services.server[slave.server]
				+setting.services["redis"].dirs["conf"]
				+'/slave.'+slave.name+"."+slave.port+'.conf';
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
