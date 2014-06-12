var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var tmpl = setting.template.dir+"/haproxy.cfg";
var confDir = setting.services.haproxy.dirs.conf;

var getOutputFiles = function(){
	var files = [];
	for (var serverId in services.server){
		var server = services.server[serverId];
		var outputFile =
			setting.output.dir
			+'/'+server+confDir
			+'/'+setting.services.haproxy.conf
			;
		files.push(outputFile);
	}
	return files;
}


var redisServicesStr = "";
var redisServices =
	new Array(services.redis.backend.master)
			.concat(services.redis.backend.slaves);
for(var i in redisServices){
	var redisService = redisServices[i];
	redisServicesStr += 
		"server "
		+redisService.name
		+" "
		+services.server[redisService.server]
		+":"
		+redisService.port
		+" check inter 1s\n"
		;
}

var mysqlMaster = services.mysql.backend.master;
var mysqlMasterStr = 
	"server "
	+mysqlMaster.name
	+" "
	+services.server[mysqlMaster.server]
	+":"
	+mysqlMaster.port
	;
var mysqlWriteMasterStr = mysqlMasterStr+" check inter 5s\n";
var mysqlReadMasterStr  = mysqlMasterStr+" check backup\n";

var mysqlSlaves = services.mysql.backend.slaves;
var mysqlSlavesStr = "";
for(var i in mysqlSlaves){
	var mysqlSlave = mysqlSlaves[i];
	mysqlSlavesStr += 
		"server "
		+mysqlSlave.name
		+" "
		+services.server[mysqlSlave.server]
		+":"
		+mysqlSlave.port
		+" <check>\n"
		;
}
var mysqlReadSlavesStr  = mysqlSlavesStr.replace(/<check>/g, "check inter 5s");
var mysqlWriteSlavesStr  = mysqlSlavesStr.replace(/<check>/g, "check backup");




var readStream = fs.createReadStream(tmpl);

var cfg = "";
readStream
	.on('data',  function (data){
		console.log('read: data');
		cfg = data.toString()
				.replace(/<mysql_write_master>/g, mysqlWriteMasterStr)
				.replace(/<mysql_write_slaves>/g, mysqlWriteSlavesStr)
				.replace(/<mysql_read_master>/g, mysqlReadMasterStr)
				.replace(/<mysql_read_slaves>/g, mysqlReadSlavesStr)
				.replace(/<mysql\.frontend\.master\.port>/g, services.mysql.frontend.master.port)
				.replace(/<mysql\.frontend\.slave\.port>/g, services.mysql.frontend.slave.port)
				.replace(/<redis_services>/g, redisServicesStr)
				.replace(/<redis\.frontend\.master\.port>/g, services.redis.frontend.master.port)
				.replace(/<redis\.frontend\.slave\.port>/g, services.redis.frontend.slave.port)
				.replace(/<haproxy\.dir\.pid>/g, setting.services.haproxy.dirs.pid)
				.replace(/<pid\.name>/g, setting.services.haproxy.pid)
				.replace(/<haproxy\.user>/g, setting.services.haproxy.user.name)
				;
		var outputFiles = getOutputFiles();
		for(var i in outputFiles){
			var outputFile = outputFiles[i];
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
