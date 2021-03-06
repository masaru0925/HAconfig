var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/my.cnf";

var readStream = fs.createReadStream(tmpl);

var createConf = function(data, mysql, isMaster) {
//		var serverId = services.server[mysql.server];
//		serverId = serverId.replace(/s/g, "");
	var cfg = 
	data.toString()
	.replace(/<services\.server\.id>/g, mysql.server.replace(/s/g, ""))
	.replace(/<mysql\.port>/g, mysql.port)
	;
	if(isMaster){
			cfg = cfg
				.replace(/<master>/g, "")
				;
	}else{
			cfg = cfg
				.replace(/<master>/g, "#")
				;
	}
	return cfg;
}

var getOutputFile = function(mysql) {
		var outputFile =
		setting.output.dir
		+'/'+services.server[mysql.server]
		+setting.services.mysql.dirs.conf
		+'/'+setting.services.mysql.conf
		;
		return outputFile;
}

var writeConfFile = function(mysql, cfg){
	var writeStream= fs.createWriteStream(getOutputFile(mysql));
	writeStream.write(cfg);
	writeStream.end();

}

readStream
	.on('data',  function (data){
		var master = services.mysql.backend.master;
		var masterConf = createConf(data, master, true);
		writeConfFile(master, masterConf);

		for(var i in services.mysql.backend.slaves){
			var slave = services.mysql.backend.slaves[i];
			var slaveConf = createConf(data, slave, false);
			writeConfFile(slave, slaveConf);
		}
	});
