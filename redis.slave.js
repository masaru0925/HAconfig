var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.slave.conf";

var read_stream = fs.createReadStream(tmpl);

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

read_stream
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
