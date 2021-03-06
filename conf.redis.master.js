var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.conf";
var master = services.redis.backend.master;
var outputFile =
	setting.output.dir
	+'/'+services.server[services.redis.backend.master.server]
	+setting.services.redis.dirs.conf
	+'/'+setting.services.redis.conf
	.replace(/<redis\.name>/g, master.name)
	.replace(/<redis\.port>/g, master.port)
	;


var readStream = fs.createReadStream(tmpl);
var writeStream= fs.createWriteStream(outputFile);

var cfg = "";
readStream
	.on('data',  function (data){
		cfg = data.toString()
			.replace(/<conf\.name>/g, setting.services.redis.conf)
			.replace(/<pid\.name>/g, setting.services.redis.pid)
			.replace(/<log\.name>/g, setting.services.redis.log)
			.replace(/<redis\.dir\.log>/g, setting.services.redis.dirs.log)
			.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
			.replace(/<redis\.dir\.lib>/g, setting.services.redis.dirs.lib)
			.replace(/<redis\.name>/g, master.name)
			.replace(/<redis\.port>/g, master.port)
			.replace(/<slave>/g, "#")
		;
		writeStream.write(cfg);
		writeStream.end();
	});
