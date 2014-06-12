var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis";

var master = services.redis.backend.master;

var outputFile =
	setting.output.dir
	+"/"+services.server[services.redis.backend.master.server]
	+setting.init.dir
	+"/redis."+master.name;


var readStream = fs.createReadStream(tmpl);
var writeStream= fs.createWriteStream(outputFile);

var cfg = "";
readStream
	.on('data',  function (data){
		console.log('read: data');
		cfg = data.toString()
			.replace(/<conf\.name>/g, setting.services.redis.conf)
			.replace(/<pid\.name>/g, setting.services.redis.pid)
			.replace(/<log\.name>/g, setting.services.redis.log)
			.replace(/<redis\.dir\.conf>/g, setting.services.redis.dirs.conf)
			.replace(/<redis\.dir\.pid>/g, setting.services.redis.dirs.pid)
			.replace(/<redis\.name>/g, master.name)
			.replace(/<redis\.port>/g, master.port)
			.replace(/<redis\.user>/g, setting.services.redis.user.name)
			.replace(/<opt>/g, "")
		;
		writeStream
			.on('drain', function (){ console.log('write: drain'); })
			.on('error', function (exeption){ console.log('write: error'); })
			.on('close', function (){ console.log('write: colse'); })
			.on('pipe',  function (src){ console.log('write: pipe');  });
		writeStream.write(cfg);
		writeStream.end();
	})
	.on('end',   function (){ console.log('read: end');   })
	.on('error', function (exception){ console.log('read: error'); })
	.on('close', function (){ console.log('read: close'); });
