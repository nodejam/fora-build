(function () {
    "use strict";
    
    var thunkify = require('thunkify'),
        path = require("path");

    var _spawn = require('child_process').spawn;
    var spawn = function(options) {
        var options = options || {};
        return function(proc, args) {
            var script = _spawn(proc, args);
            if (options.log) {
                script.stdout.on('data', function (data) {
                    options.log(data);
                });
            }
            return script;
        }
    }

    var _exec = require('child_process').exec
    var exec = function(options) {
        var options = options || {};
        return thunkify(function(cmd, cb) {
            if (options.log)
                options.log(cmd);
            _exec(cmd, function(err, stdout, stderr) {
                cb(err, stdout.substring(0, stdout.length - 1));
            });
        });
    }

    var fs = require('fs');
    var ensureDirExists = function(options) {
        var options = options || {};
        var fnExec = exec();
        return function*(file) {            
            var dir = path.dirname(file);
            if (!fs.existsSync(dir)) {
                yield fnExec("mkdir -p " + dir);
            } 
        }
    }

    module.exports = {
        fs: {
           ensureDirExists: ensureDirExists 
        },
        process: {
            exec: exec,
            spawn: spawn
        }
    }

})();
