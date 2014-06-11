var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, sentinel) {
	return data.toString()
		.replace(/<redis\.dir\.conf>/g, setting.services.redis.dirs.conf)
		.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
		.replace(/<redis\.name>/g, "sentinel")
		.replace(/<redis\.port>/g, sentinel.port)
		.replace(/<redis\.user>/g, setting.services.redis.user.name)
		.replace(/<opt>/g, "--sentinel")
		;
}

readStream
	.on('data',  function (data){
		console.log('read: data');
		for(var i in services.redis.sentinels){
;
			var sentinel = services.redis.sentinels[i];
			var cfg = createConf(data, sentinel);
			var outputFile =
				 setting.output.dir
				+'/'+services.server[sentinel.server]
				+setting.init.dir
				+'/redis.sentinel.'+sentinel.port;
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