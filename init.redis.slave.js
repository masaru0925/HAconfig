var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, slave) {
	return data.toString()
		.replace(/<conf\.name>/g, setting.services.redis.conf)
		.replace(/<pid\.name>/g, setting.services.redis.pid)
		.replace(/<log\.name>/g, setting.services.redis.log)
		.replace(/<redis\.dir\.conf>/g, setting.services.redis.dirs.conf)
		.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
		.replace(/<redis\.name>/g, slave.name)
		.replace(/<redis\.port>/g, slave.port)
		.replace(/<redis\.user>/g, setting.services.redis.user.name)
		.replace(/<opt>/g, "")
		;
}

readStream
	.on('data',  function (data){
		for(var i in services.redis.backend.slaves){
			var slave = services.redis.backend.slaves[i];
			var cfg = createConf(data, slave);
			var outputFile =
				 setting.output.dir
				+"/"+services.server[slave.server]
				+setting.init.dir
				+"/redis."+slave.name;
			var writeStream= fs.createWriteStream(outputFile);
			writeStream.write(cfg);
			writeStream.end();
		}
	});
