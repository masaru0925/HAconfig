var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/redis.master.conf";
var outputFile =
	setting.output.dir
	+"/"+services.server[services.redis.backend.master.server]
	+setting.services["redis"].dirs["conf"]
	+"/master.conf";

var master = services.redis.backend.master;

var read_stream = fs.createReadStream(tmpl);
var write_stream= fs.createWriteStream(outputFile);

var cfg = "";
read_stream
	.on('data',  function (data){
		console.log('read: data');
		cfg = data.toString()
			.replace(/<redis\.dir\.log>/g, setting.services["redis"].dirs["log"])
			.replace(/<redis\.dir\.pid>/g, setting.services["redis"].dirs["pid"])
			.replace(/<redis\.dir\.lib>/g, setting.services["redis"].dirs["lib"])
			.replace(/<master\.name>/g, master.name)
			.replace(/<master\.port>/g, master.port)
		;
		write_stream
			.on('drain', function (){ console.log('write: drain'); })
			.on('error', function (exeption){ console.log('write: error'); })
			.on('close', function (){ console.log('write: colse'); })
			.on('pipe',  function (src){ console.log('write: pipe');  });
		write_stream.write(cfg);
		write_stream.end();
	})
	.on('end',   function (){ console.log('read: end');   })
	.on('error', function (exception){ console.log('read: error'); })
	.on('close', function (){ console.log('read: close'); });
