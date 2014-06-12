var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, sentinel) {
	return data.toString()
		.replace(/<conf\.name>/g, setting.services.redis.conf)
		.replace(/<pid\.name>/g, setting.services.redis.pid)
		.replace(/<log\.name>/g, setting.services.redis.log)
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
		for(var i in services.redis.sentinels){
			var sentinel = services.redis.sentinels[i];
			var cfg = createConf(data, sentinel);
			var outputFile =
				 setting.output.dir
				+'/'+services.server[sentinel.server]
				+setting.init.dir
				+'/redis.sentinel.'+sentinel.port;
			var writeStream= fs.createWriteStream(outputFile);
			writeStream.write(cfg);
			writeStream.end();
		}
	});
