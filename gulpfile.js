var gulp = require('gulp'),
    fileSync = require('gulp-file-sync'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    colors = require('colors');

var _fileMaps = {}, //Cache the file mapping relationship for improving performance
    _initDone = false,
    _config = {//Global settings for source and target folder information
        simple: {
            src: "SimpleStore/**/*.*",
            destRoot: "EcoSite",
            destDllFolder: "D:\\workbench\\EcoSite\\dnn804install\\bin"
        },
        ecommerce: {
            src: "Ecommerce/src/**/*.*",
            destRoot: "NewEcommerceSite",
            forceSyncRootFolder: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\DesktopModules\\MVC\\StormStore",
            mustSyncFolders: ["\\src\\StormStore.Admin\\", "\\src\\StormStore.Public\\"],
            destDllFolder: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin",
            dllsMatchTable: [
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Helper\\bin\\Debug\\StormStore.Helper.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Helper.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Helper\\bin\\Debug\\StormStore.Helper.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Helper.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Data\\bin\\Debug\\StormStore.Data.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Data.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Data\\bin\\Debug\\StormStore.Data.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Data.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Layout\\bin\\StormStore.Layout.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Layout.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Layout\\bin\\StormStore.Layout.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Layout.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.API\\bin\\Debug\\StormStore.API.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.API.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.API\\bin\\Debug\\StormStore.API.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.API.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\Plugins\\Bin\\RainstormTech.Payment.AuthorizeNet.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\RainstormTech.Payment.AuthorizeNet.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\Plugins\\Bin\\RainstormTech.Payment.AuthorizeNet.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\RainstormTech.Payment.AuthorizeNet.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\stormstore.public\\bin\\StormStore.Admin.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Admin.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Admin\\obj\\Debug\\StormStore.Admin.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Admin.pdb"
                },

                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Public\\bin\\StormStore.Public.dll",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Public.dll"
                },
                {
                    src: "D:\\workbench\\Ecommerce\\src\\StormStore.Public\\bin\\StormStore.Public.pdb",
                    dest: "D:\\workbench\\NewEcommerceSite\\DNN804226Install\\bin\\StormStore.Public.pdb"
                }
            ]
        }
    };

Date.prototype.Format = function (fmt) { //Format the date by specified format author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function travel(dir, fileName, fullName, callback) {
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);
        try {
            if (fs.statSync(pathname).isDirectory()) {
                travel(pathname, fileName, fullName, callback);
            } else {
                callback(pathname, fileName, fullName, false);
            }
        }
        catch (err) {
            callback(pathname, fileName, fullName, true);
        }
    });
}

function copy(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src)); //syncly copy files
    console.log("SYNC FILE ON " + new Date().Format("yyyy-MM-dd hh:mm:ss") + " :");
    console.log(("    " + src).green.bold);
    console.log("WITH :");
    console.log(("    " + dst).green.bold);
    console.log("==========================================================================================================================");
}

gulp.task('init', function () {
    //Init file mappings
    if (!_initDone) {
        _fileMaps = JSON.parse(fs.readFileSync("mappings.json"));
        _initDone = true;
        console.log("Init is done!".green.bold)
    }
})

gulp.task('initEco', function () {
    //Init file mappings
    if (!_initDone) {
        _fileMaps = JSON.parse(fs.readFileSync("eco.mappings.json"));
        _initDone = true;
        console.log("Init Ecomm is done!".green.bold)
    }
})

gulp.task('sync', ['init'], function () {
    return gulp.watch(_config.simple.src, function (event) {
        var pathArray = event.path.split("\\");
        var fileName = pathArray[pathArray.length - 1];
        var filePathArray = fileName.split(".");
        var fileExt = filePathArray[filePathArray.length - 1];

        //for debug
        //console.log(event.type.yellow.bold);
        //console.log(event.path.yellow.bold);

        if (event.type == "added") {
            //sync .dll,dll.config and .pdb files
            // if (event.path.indexOf("SteadyRain.SimpleStore.Modules") != -1 &&
            // event.path.indexOf("\\obj\\") == -1) {
            if (event.path.indexOf("SimpleStore\\SimpleStore\\bin") != -1 &&
                (fileName == "SteadyRain.SimpleStore.dll" ||
                fileName == "SteadyRain.SimpleStore.dll.config" ||
                fileName == "SteadyRain.SimpleStore.pdb")) {
                console.log("SYNC DLL FILE!".yellow.bold)
                copy(event.path, path.join(_config.simple.destDllFolder, fileName));
                return;
            }
        }

        if (event.type == "changed") {
            if (fileExt == "dll" || fileExt == "ascx" || fileExt == "js" || fileExt == "css" ||
                fileExt == 'html' || fileExt == 'htm') {
                //If target file is already mapped then sync directly
                //instead of recursively to locate the file
                if (_fileMaps[event.path]) {
                    console.log(fileName + " is changed and sync with the mapping file directly.");
                    //Todo: comment it temporialy.
                    copy(event.path, _fileMaps[event.path]);
                    return;
                }

                console.log((fileName + " is changed and recursively travel from root folder to find the mapping file!").yellow);

                travel(_config.simple.destRoot, fileName, event.path, function (pathName, fileName, fullName) {
                    if (pathName.indexOf(fileName) != -1) {//File name is same
                        var destArray = pathName.split("\\");

                        //console.log(pathArray.slice(pathArray.length - 4, pathArray.length));
                        //console.log(destArray.slice(destArray.length - 4, destArray.length));

                        if (destArray.slice(destArray.length - 4, destArray.length).join("").toLocaleLowerCase() ==
                            pathArray.slice(pathArray.length - 4, pathArray.length).join("").toLocaleLowerCase()) {
                            copy(fullName, pathName);
                            //add to cache
                            _fileMaps[fullName] = pathName;
                            //persit cache
                            fs.writeFileSync("mappings.json", JSON.stringify(_fileMaps));
                            return;
                        }

                    }
                })
            }
        }
    });
});

gulp.task("syncdll", function () {
    _config.ecommerce.dllsMatchTable.forEach(function (mapping) {
        copy(mapping.src, mapping.dest);
    })
    console.log("Sync dlls done!");
})

function isValidFileExt(fileExt) {
    return fileExt == "cshtml" ||
        fileExt == "aspx" ||
        fileExt == "ascx" ||
        fileExt == "js" ||
        fileExt == "css" ||
        fileExt == 'html' ||
        fileExt == 'htm';
}

function isFileForcedToSync(path) {
    var result = false;
    _config.ecommerce.mustSyncFolders.forEach(function (item) {
        if (path.indexOf(item) != -1) {
            result = true;
        }
    });
    return result;
}

gulp.task('ecosync', ['initEco'], function () {
    return gulp.watch(_config.ecommerce.src, function (event) {
        var pathArray = event.path.split("\\"),
            fileName = pathArray[pathArray.length - 1],
            filePathArray = fileName.split("."),
            fileExt = filePathArray[filePathArray.length - 1],
            syncNeeded = false;

        //for debug
        //console.log(event.type.yellow.bold);
        //console.log(event.path.yellow.bold);

        if (event.type == "added") {
            if (isValidFileExt(fileExt)) {
                syncNeeded = isFileForcedToSync(event.path);
            } else {
                return;
            }
        }

        if (event.type == "changed") {
            if (isValidFileExt(fileExt)) {
                syncNeeded = isFileForcedToSync(event.path);

                //If target file is already mapped then sync directly
                //instead of recursively to locate the file
                if (_fileMaps[event.path]) {
                    //console.log(fileName + " is changed and sync with the mapping file directly.");
                    copy(event.path, _fileMaps[event.path]);
                    syncNeeded = false;
                    return;
                }

                //for debug
                //console.log((fileName + " is changed and recursively travel from root folder to find the mapping file!").yellow);

                travel(_config.ecommerce.destRoot, fileName, event.path, function (pathName, fileName, fullName, ignore) {
                    if (ignore) {
                        return;
                    }

                    if (pathName.indexOf(fileName) != -1) {//File name is same
                        var destArray = pathName.split("\\");
                        var offSet = 4;
                        if (pathArray.length < 7) {
                            offSet = 2;
                        } else if ((pathArray.length - 4) <= 3)
                            offSet = 3;

                        //console.log(pathArray.slice(pathArray.length-4, pathArray.length));
                        //console.log(destArray.slice(destArray.length-4, destArray.length));

                        if (destArray.slice(destArray.length - offSet, destArray.length).join("").toLocaleLowerCase() ==
                            pathArray.slice(pathArray.length - offSet, pathArray.length).join("").toLocaleLowerCase()) {
                            copy(fullName, pathName);
                            syncNeeded = false;
                            //add to cache
                            _fileMaps[fullName] = pathName;
                            //persit cache
                            fs.writeFileSync("eco.mappings.json", JSON.stringify(_fileMaps));
                            return;
                        }
                    }
                });

                if (syncNeeded) {
                    var dest = _config.ecommerce.forceSyncRootFolder,
                        src = pathArray.slice(4, pathArray.length - 1).join("\\"), //Hard code
                        target = path.join(dest, src),
                        fullTargetFilename = path.join(target, fileName);

                    //console.log("src: " + src);
                    //console.log("target: " + target);
                    //console.log("target file : " + path.join(target, fileName));

                    mkdirp(target, function (err) {//create the folder at first then copy the file
                        if (err) {
                            console.error(err);
                        } else {
                            copy(event.path, fullTargetFilename);
                            //add to cache
                            _fileMaps[event.path] = fullTargetFilename;
                            //persit cache
                            fs.writeFileSync("eco.mappings.json", JSON.stringify(_fileMaps));
                            console.log('Force sync folder&file done!');
                        }
                        ;
                        syncNeeded = false;
                    });
                }
            }
        }
    });
});