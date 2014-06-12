var services = require('./services.json');
var setting = require('./setting.json');
var fs = require('fs');
var mkdirp = require('mkdirp');

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

console.log("deleting dir: " +setting.output.dir);
deleteFolderRecursive(setting.output.dir);
for(var serverId in services.server){
	console.log("creating conf and init.d dir for server: " +serverId +"("+services.server[serverId]+")");
	var initDir = services.server[serverId]+setting.init.dir;
	mkdirp(setting.output.dir+"/"+initDir, function(err){ if(err){ console.error(err); }else{ } });
	for(var serviceId in setting.services){
		var service = setting.services[serviceId];
		var confDir = services.server[serverId]+service.dirs.conf;
		mkdirp(setting.output.dir+"/"+confDir, function(err){ if(err){ console.error(err); }else{ } });
	}
}
console.log("+----------------------------------------------------------+");
console.log("+ hit following commands  @each server");
console.log("+----------------------------------------------------------+");
console.log("|\t$ sudo mkdir -p "+setting.services.haproxy.dirs.conf);
console.log("|\t$ sudo mkdir -p "+setting.services.haproxy.dirs.log);
console.log("|\t$ sudo mkdir -p "+setting.services.haproxy.dirs.pid);
console.log("|\t$ sudo mkdir -p "+setting.services.haproxy.dirs.lib);
console.log("|\t$ sudo chown -R "+setting.services.haproxy.user.name+"."+setting.services.haproxy.group.name +" "+setting.services.haproxy.dirs.conf);
console.log("|\t$ sudo chown -R "+setting.services.haproxy.user.name+"."+setting.services.haproxy.group.name +" "+setting.services.haproxy.dirs.log);
console.log("|\t$ sudo chown -R "+setting.services.haproxy.user.name+"."+setting.services.haproxy.group.name +" "+setting.services.haproxy.dirs.pid);
console.log("|\t$ sudo chown -R "+setting.services.haproxy.user.name+"."+setting.services.haproxy.group.name +" "+setting.services.haproxy.dirs.lib);
console.log("|");
console.log("|\t$ sudo mkdir -p "+setting.services.redis.dirs.conf);
console.log("|\t$ sudo mkdir -p "+setting.services.redis.dirs.lib);
console.log("|\t$ sudo mkdir -p "+setting.services.redis.dirs.log);
console.log("|\t$ sudo mkdir -p "+setting.services.redis.dirs.pid);
console.log("|\t$ sudo chown -R "+setting.services.redis.user.name+"."+setting.services.redis.group.name +" "+setting.services.redis.dirs.conf);
console.log("|\t$ sudo chown -R "+setting.services.redis.user.name+"."+setting.services.redis.group.name +" "+setting.services.redis.dirs.lib);
console.log("|\t$ sudo chown -R "+setting.services.redis.user.name+"."+setting.services.redis.group.name +" "+setting.services.redis.dirs.log);
console.log("|\t$ sudo chown -R "+setting.services.redis.user.name+"."+setting.services.redis.group.name +" "+setting.services.redis.dirs.pid);
console.log("+----------------------------------------------------------+");
