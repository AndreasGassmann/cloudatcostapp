angular.module('starter.services', [])

    .factory('Servers', function(dataStorage) {
        var servers = {};
        servers.response = dataStorage.getServers() || [];
        return {
            data: servers,
            update: function (data) {
                servers.response = data;
                dataStorage.saveServers(data);
            },
            get: function(serverId) {
                return _.find(servers.response.data, function(server){ return server.id == serverId; }) || [];
            },
            clear: function() {
                servers.response = [];
                dataStorage.clearStorageField("servers");
            }
        };
    })

    .factory('Tasks', function(dataStorage) {
        var tasks = {};
        tasks.response = dataStorage.getTasks() || [];
        return {
            data: tasks,
            update: function (data) {
                tasks.response = data;
                dataStorage.saveTasks(data);
            },
            get: function(serverId) {
                return _.sortBy(_.filter(tasks.response.data, function(task){ return task.serverid == serverId; }), 'finishtime') || [];
            },
            clear: function() {
                tasks.response = [];
                dataStorage.clearStorageField("tasks");
            }
        };
    })

    .factory('Templates', function(dataStorage) {
        var templates = {};
        templates.response = dataStorage.getTemplates() || [];
        return {
            data: templates,
            update: function (data) {
                templates.response = data;
                dataStorage.saveTemplates(data);
            },
            clear: function() {
                templates.response = [];
                dataStorage.clearStorageField("templates");
            }
        };
    })

    .factory('detailServer', function(Servers, Tasks) {
        var server = {};
        server.server = [];
        server.tasks = [];
        return {
            data: server,
            get: function(serverId) {
                server.server = Servers.get(serverId);
                server.tasks = Tasks.get(serverId);
                return this.data;
            },
            clear: function() {
                server.server = [];
                server.tasks = [];
            }
        };
    })

    .factory('dataRequestService', function($http, $ionicPopup, dataStorage, Servers, Tasks, Templates) {
        delete $http.defaults.headers.common['X-Requested-With'];

        var responseStatus = {};
        responseStatus.responseTime = dataStorage.getResponseTime() || "";
        responseStatus.message = "";

        var POSTgetConsole = function(email, APIKey, serverId, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/console.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+email+"&sid="+serverId
            }).success(function(data, status, headers, config){
                callback(data);
            }).error(function(data, status, headers, config){
                if (data.console) {
                    callback(data);
                } else {
                    if (data.error_description) {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error: ' + data.error_description
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error, please try again.'
                        });
                    }
                }
            });
        };
        var POSTrenameServer = function(email, APIKey, serverId, newServerName, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            console.log("renaming server:");
            console.log('https://panel.cloudatcost.com/api/v1/renameserver.php: ' + "key="+APIKey+"&login="+email+"&sid="+serverId+"&name="+newServerName);
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/renameserver.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+email+"&sid="+serverId+"&name="+newServerName
            }).success(function(data, status, headers, config){
                callback(data);
            }).error(function(data, status, headers, config){
                if (data.result === "successful") {
                    callback(data);
                } else {
                    if (data.error_description) {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error: ' + data.error_description
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error, please try again.'
                        });
                    }
                }
            });
        };
        var POSTmodifyDNS = function(email, APIKey, serverId, newHostname, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            console.log("https://panel.cloudatcost.com/api/v1/rdns.php: key="+APIKey+"&login="+email+"&sid="+serverId+"&hostname="+newHostname);
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/rdns.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+email+"&sid="+serverId+"&hostname="+newHostname
            }).success(function(data, status, headers, config){
                callback(data);
            }).error(function(data, status, headers, config){
                if (data.result === "successful") {
                    callback(data);
                } else {
                    if (data.error_description) {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error: ' + data.error_description
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error, please try again.'
                        });
                    }
                }
            });
        };
        var POSTpowerOperation = function(email, APIKey, serverId, action, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/powerop.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+email+"&sid="+serverId+"&action="+action
            }).success(function(data, status, headers, config){
                callback(data);
            }).error(function(data, status, headers, config){
                if (data.result === "successful") {
                    callback(data);
                } else {
                    if (data.error_description) {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error: ' + data.error_description
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Oh no!',
                            template: 'There was an error, please try again.'
                        });
                    }
                }
            });
        };
        var getIp = function(callback) {
            $http({
                method: 'GET',
                url: 'http://ipecho.net/plain'
            }).success(function(data, status, headers, config){
                callback(" Your current IP: " + data);
            }).error(function(data, status, headers, config){
                callback("");
            });
        };
        var startRequest = function(list, APIKey, email, callback) {
            if (email === 'email@example.com' && APIKey === '123456789') {
                if (list == 'servers') {
                    callback(200,
                        {
                            "status": "ok",
                            "time": 1427411655,
                            "api": "v1",
                            "action": "listservers",
                            "data": [
                                {
                                    "sid": "524132412",
                                    "id": "524132412",
                                    "packageid": "16",
                                    "servername": "c2223141-42116",
                                    "label": "Developer 3",
                                    "lable": "Developer 3",
                                    "vmname": "c91132-453264-72341234-223122",
                                    "ip": "132.161.218.112",
                                    "netmask": "255.255.255.0",
                                    "gateway": "132.161.218.1",
                                    "portgroup": "Cloud-ip-32",
                                    "hostname": "c2223141-42116.cloudatcost.com",
                                    "rootpass": "F3RsG53Df",
                                    "vncport": "41197",
                                    "vncpass": "WfsGBRuJ",
                                    "servertype": "Custom",
                                    "template": "Ubuntu-14.04.1-LTS-64bit",
                                    "cpu": "4",
                                    "cpuusage": "242",
                                    "ram": "2048",
                                    "ramusage": "701.521",
                                    "storage": "40",
                                    "hdusage": "31.45323234",
                                    "sdate": "01\/16\/2015",
                                    "status": "Powered On",
                                    "panel_note": null,
                                    "mode": "Normal",
                                    "uid": "642346234"
                                },
                                {
                                    "sid": "423142525",
                                    "id": "423142525",
                                    "packageid": "25",
                                    "servername": "c2425532-33214",
                                    "label": "Big Dog 3",
                                    "lable": "Big Dog 3",
                                    "vmname": "c90000-783788-441529187-25358",
                                    "ip": "93.67.213.36",
                                    "netmask": "255.255.255.0",
                                    "gateway": "93.67.213.1",
                                    "portgroup": "Cloud-ip-23",
                                    "hostname": "c2425532-33214.cloudatcost.com",
                                    "rootpass": "jgkasFGJ8",
                                    "vncport": "55211",
                                    "vncpass": "BDSj8Ji9SJ",
                                    "servertype": "Custom",
                                    "template": "Windows 2012 R2 64bit (BigDogs Only)",
                                    "cpu": "8",
                                    "cpuusage": "161",
                                    "ram": "8192",
                                    "ramusage": "2642.42",
                                    "storage": "80",
                                    "hdusage": "77.4455648765",
                                    "sdate": "12\/28\/2014",
                                    "status": "Powered On",
                                    "panel_note": null,
                                    "mode": "Normal",
                                    "uid": "234627342"
                                },
                                {
                                    "sid": "421223114",
                                    "id": "421223114",
                                    "packageid": "28",
                                    "servername": "c3213142-32142",
                                    "label": "Minecraft",
                                    "lable": "Minecraft",
                                    "vmname": "c436234-152525-574325453-12314",
                                    "ip": "112.141.11.122",
                                    "netmask": "255.255.255.0",
                                    "gateway": "112.141.11..1",
                                    "portgroup": "Cloud-ip-45",
                                    "hostname": "c3213142-32142.cloudatcost.com",
                                    "rootpass": "lkd85a6g4",
                                    "vncport": "24654",
                                    "vncpass": "dag4w98csa",
                                    "servertype": "Custom",
                                    "template": "Minecraft-CentOS-7-64bit",
                                    "cpu": "8",
                                    "cpuusage": "782",
                                    "ram": "8192",
                                    "ramusage": "6789.546",
                                    "storage": "80",
                                    "hdusage": "7.459795467",
                                    "sdate": "01\/22\/2015",
                                    "status": "Powered On",
                                    "panel_note": null,
                                    "mode": "Normal",
                                    "uid": "732723463"
                                }
                            ]
                        }
                    );
                }

                if (list == 'tasks') {
                    callback(200,
                        {
                            "status": "ok",
                            "time": 1427411655,
                            "api": "v1",
                            "cid": "562644634",
                            "action": "listtasks",
                            "data": [
                                {
                                    "cid": "562644634",
                                    "idf": "865359735573",
                                    "serverid": "524132412",
                                    "action": "poweron",
                                    "status": "completed",
                                    "starttime": "1426354391",
                                    "finishtime": "1426354412"
                                },
                                {
                                    "cid": "562644634",
                                    "idf": "357358694563",
                                    "serverid": "524132412",
                                    "action": "poweroff",
                                    "status": "completed",
                                    "starttime": "1426354483",
                                    "finishtime": "1426354505"
                                },
                                {
                                    "cid": "562644634",
                                    "idf": "865359793563",
                                    "serverid": "421223114",
                                    "action": "reset",
                                    "status": "completed",
                                    "starttime": "1427411655",
                                    "finishtime": "1427411955"
                                }
                            ]
                        }
                    );
                }
                if (list == 'templates') {
                    callback(200,
                        {
                            "status": "ok",
                            "time": 1427411655,
                            "api": "v1",
                            "action": "listtemplates",
                            "data": [
                                {
                                    "id": "26",
                                    "detail": "CentOS-7-64bit"
                                },
                                {
                                    "id": "27",
                                    "detail": "Ubuntu-14.04.1-LTS-64bit"
                                },
                                {
                                    "id": "15",
                                    "detail": "CentOS 6.5 64bit (LAMP)"
                                },
                                {
                                    "id": "21",
                                    "detail": "Ubuntu 12.10 64bit"
                                },
                                {
                                    "id": "23",
                                    "detail": "Ubuntu 12.04.3 LTS 64bit"
                                },
                                {
                                    "id": "24",
                                    "detail": "Windows 2008 R2 64bit (BigDogs Only)"
                                },
                                {
                                    "id": "25",
                                    "detail": "Windows 2012 R2 64bit (BigDogs Only)"
                                },
                                {
                                    "id": "14",
                                    "detail": "CentOS 6.5 64bit (cPanel-WHM)"
                                },
                                {
                                    "id": "13",
                                    "detail": "CentOS 6.5 64bit"
                                },
                                {
                                    "id": "10",
                                    "detail": "CentOS 6.5 32bit"
                                },
                                {
                                    "id": "3",
                                    "detail": "Debian 7.1 64bit"
                                },
                                {
                                    "id": "9",
                                    "detail": "Windows7 64bit (BigDogs Only)"
                                },
                                {
                                    "id": "2",
                                    "detail": "Ubuntu-13.10-64bit"
                                },
                                {
                                    "id": "1",
                                    "detail": "CentOS 6.4 64bit"
                                },
                                {
                                    "id": "28",
                                    "detail": "Minecraft-CentOS-7-64bit"
                                }
                            ]
                        }
                    );
                }
            } else {
                $http({
                    method: 'GET',
                    url: 'https://panel.cloudatcost.com/api/v1/list'+list+'.php?key='+APIKey+'&login='+email
                }).success(function(data, status, headers, config){
                    callback(status, data);
                }).error(function(data, status, headers, config){
                    callback(status, data);
                });
            }
        };
        return {
            status: responseStatus,
            getData: function(callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                if (email && APIKey && email.length > 0 && APIKey.length > 0) {

                    var errorMessage = "There was an error. Make sure your credentials are correct and you set the correct IP in the CloudAtCost Panel.";
                    startRequest("servers", APIKey, email, function (status, dataResponse) {
                        if (status == 200) {
                            responseStatus.message = "";
                            Servers.update(dataResponse);
                            responseStatus.responseTime = (dataResponse.time * 1000);
                            dataStorage.saveResponseTime((dataResponse.time * 1000).toString());
                            startRequest("tasks", APIKey, email, function (status, dataResponse) {
                                if (status == 200) {
                                    responseStatus.message = "";
                                    Tasks.update(dataResponse);
                                    startRequest("templates", APIKey, email, function (status, dataResponse) {
                                        if (status == 200) {
                                            responseStatus.message = "";
                                            Templates.update(dataResponse);
                                        } else {
                                            getIp(function(data) {
                                                responseStatus.message = errorMessage + data;
                                            });
                                        }
                                    });
                                } else {
                                    getIp(function(data) {
                                        responseStatus.message = errorMessage + data;
                                    });
                                }
                            });
                        } else {
                            getIp(function(data) {
                                responseStatus.message = errorMessage + data;
                            });
                        }
                    });
                    callback();
                } else {
                    responseStatus.message = "Please set your Email and API-Key in the settings and try again";
                    callback();
                }
            },
            getCurrentIP: function(callback) {
                getIp(callback);
            },
            getConsole: function(serverId, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTgetConsole(email, APIKey, serverId, callback);
            },
            powerOperation: function(action, serverId, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTpowerOperation(email, APIKey, serverId, action, callback);
            },
            renameServer: function(serverId, newServerName, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTrenameServer(email, APIKey, serverId, newServerName, callback);
            },
            modifyDNS: function(serverId, newHostname, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTmodifyDNS(email, APIKey, serverId, newHostname, callback);
            },
            clear: function() {
                responseStatus.responseTime = "";
                responseStatus.message = "";
            }
        };
    })

    .factory('dataStorage', function(AES) {
        var passphrase = "SECRET_PASS_PHRASE";

        return {
            saveEmail: function(email) {
                window.localStorage.setItem("email", AES.encrypt(email, passphrase));
            },
            saveAPIKey: function(APIKey) {
                window.localStorage.setItem("APIKey", AES.encrypt(APIKey, passphrase));
            },
            saveResponseTime: function(responseTime) {
                window.localStorage.setItem("responseTime", AES.encrypt(responseTime, passphrase));
            },
            saveServers: function(servers) {
                window.localStorage.setItem("servers", AES.encrypt(JSON.stringify(servers), passphrase));
            },
            saveTasks: function(tasks) {
                window.localStorage.setItem("tasks", AES.encrypt(JSON.stringify(tasks), passphrase));
            },
            saveTemplates: function(templates) {
                window.localStorage.setItem("templates", AES.encrypt(JSON.stringify(templates), passphrase));
            },
            getEmail: function() {
                if (window.localStorage.getItem("email")) {
                    return AES.decrypt(window.localStorage.getItem("email"), passphrase);
                } else {
                    return "";
                }
            },
            getAPIKey: function() {
                if (window.localStorage.getItem("APIKey")) {
                    return AES.decrypt(window.localStorage.getItem("APIKey"), passphrase);
                } else {
                    return "";
                }
            },
            getResponseTime: function() {
                if (window.localStorage.getItem("responseTime")) {
                    return AES.decrypt(window.localStorage.getItem("responseTime"), passphrase);
                } else {
                    return "";
                }
            },
            getServers: function() {
                if (window.localStorage.getItem("servers")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("servers"), passphrase)) ? JSON.parse(AES.decrypt(window.localStorage.getItem("servers"), passphrase)) : "";
                } else {
                    return [];
                }
            },
            getTasks: function() {
                if (window.localStorage.getItem("tasks")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("tasks"), passphrase)) ? JSON.parse(AES.decrypt(window.localStorage.getItem("tasks"), passphrase)) : "";
                } else {
                    return [];
                }
            },
            getTemplates: function() {
                if (window.localStorage.getItem("templates")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("templates"), passphrase)) ? JSON.parse(AES.decrypt(window.localStorage.getItem("templates"), passphrase)) : "";
                } else {
                    return [];
                }
            },
            clearStorage: function() {
                window.localStorage.removeItem("email");
                window.localStorage.removeItem("APIKey");
                window.localStorage.removeItem("responseTime");
            },
            clearStorageField: function (string) {
                window.localStorage.removeItem(string);
            }
        };
    })

    .factory('AES', function() {
        var iterationCount = 1000;
        var keySize = 128;
        var iv = "6edmJL==2c3#2@t6HMeWNLu{NY6z4U";
        var salt = "v?BBKmLuPcxEaETj=Ujx3/Tm6{8uY9zwXm2GfsGdHT6WHtEH]84k+8n26kj9}EWX[AFQLi]U63J)mPme";

        var aesUtil = new AesUtil(keySize, iterationCount);

        return {
            encrypt: function(text, passphrase) {
                return aesUtil.encrypt(salt, iv, passphrase, text);
            },
            decrypt: function(text, passphrase) {
                return aesUtil.decrypt(salt, iv, passphrase, text);
            }
        };
    });
