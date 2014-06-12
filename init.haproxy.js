var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/haproxy";


var getOutputFiles = function(){
	var files = [];
	for (var serverId in services.server){
		var server = services.server[serverId];
		var outputFile =
			setting.output.dir
			+"/"
			+server+setting.init.dir
			+"/"+setting.services.haproxy.init;
		files.push(outputFile);
	}
	return files;
}

var createConf = function(data) {
	return data.toString()
		.replace(/<conf\.name>/g, setting.services.haproxy.conf)
		.replace(/<pid\.name>/g, setting.services.haproxy.pid)
		.replace(/<log\.name>/g, setting.services.haproxy.log)
		.replace(/<haproxy\.dir\.conf>/g, setting.services.haproxy.dirs.conf)
		.replace(/haproxy\.dir\.pid>/g, setting.services.haproxy.dirs.pid)
		.replace(/<haproxy\.user>/g, setting.services.haproxy.user.name)
		;
}


var readStream = fs.createReadStream(tmpl);

readStream
	.on('data',  function (data){
		var cfg = createConf(data);
		var outputFiles = getOutputFiles();
		for(var i in outputFiles){
			var outputFile = outputFiles[i];
			var writeStream= fs.createWriteStream(outputFile);
			writeStream.write(cfg);
			writeStream.end();
		}
	});
