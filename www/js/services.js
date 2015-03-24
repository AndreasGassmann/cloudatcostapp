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
                    $ionicPopup.alert({
                        title: 'Oh no!',
                        template: 'There was an error, please try again.'
                    });
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
                if (data.result == "successful") {
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
            $http({
                method: 'GET',
                url: 'https://panel.cloudatcost.com/api/v1/list'+list+'.php?key='+APIKey+'&login='+email
            }).success(function(data, status, headers, config){
                callback(status, data);
            }).error(function(data, status, headers, config){
                callback(status, data);
            });
        };
        return {
            status: responseStatus,
            getData: function(callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                if (email && APIKey && email.length > 0 && APIKey.length > 0) {

                    var errorMessage = "There was an error. Make sure your credentials are correct and you set the correct IP in the CloudAtCost Panel";
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
