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

        var template_images = [];

        // From the CloudAtCost Panel HTML
        template_images[1] = 'centos';
        template_images[15] = 'centos';
        template_images[3] = 'debian';
        template_images[19] = 'docker';
        template_images[18] = 'freebsd';
        template_images[17] = 'minecraft';
        template_images[16] = 'ubuntu';
        template_images[13] = 'windows-server-2008';
        template_images[14] = 'windows-server-2012';
        template_images[4] = 'windows-7';

        // From the API
        template_images[9] = 'windows-7';
        template_images[24] = 'windows-server-2008';
        template_images[25] = 'windows-server-2012';
        template_images[26] = 'centos';
        template_images[27] = 'ubuntu';
        template_images[28] = 'minecraft';
        template_images[74] = 'freebsd';
        template_images[75] = 'docker';

        // From testing
        template_images[21] = 'ubuntu';
        template_images[23] = 'ubuntu';
        template_images[10] = 'centos';
        template_images[2] = 'ubuntu';
        template_images[16] = 'ubuntu';

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
            },
            getTemplateImage: function(id) {
                if (template_images[id]) {
                    return 'img/' + template_images[id]+'.png';
                } else {
                    //TODO: add unknown image
                    return 'img/white.png';
                }
            }
        };
    })

    .factory('Cloudpro', function(dataStorage) {
        var cloudpro = {};
        cloudpro.response = dataStorage.getCloudpro() || [];
        return {
            data: cloudpro,
            update: function (data) {
                cloudpro.response = data;
                dataStorage.saveCloudpro(data);
            },
            clear: function() {
                cloudpro.response = [];
                dataStorage.clearStorageField("cloudpro");
            }
        };
    })

    .factory('dataRequestService', function($http, $ionicPopup, dataStorage, Servers, Tasks, Templates, Cloudpro) {
        delete $http.defaults.headers.common['X-Requested-With'];

        var responseStatus = {};
        responseStatus.responseTime = dataStorage.getResponseTime() || "";
        responseStatus.message = "";

        var POSTgetConsole = function(email, APIKey, serverId, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/console.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+'&ip_bypass=1'
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
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/renameserver.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+"&name="+newServerName+'&ip_bypass=1'
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
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/rdns.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+"&hostname="+newHostname+'&ip_bypass=1'
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
        var POSTswitchRunmode = function(email, APIKey, serverId, mode, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/runmode.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+"&mode="+mode+'&ip_bypass=1'
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
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+"&action="+action+'&ip_bypass=1'
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
        var POSTcloudproBuildServer = function(email, APIKey, cpu, ram, storage, os, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/cloudpro/build.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&cpu="+cpu+"&ram="+ram+"&storage="+storage+"&os="+os+'&ip_bypass=1'
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

        var POSTcloudproDeleteServer = function(email, APIKey, serverId, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            $http({
                url: 'https://panel.cloudatcost.com/api/v1/cloudpro/delete.php',
                method: 'POST',
                data: "key="+APIKey+"&login="+encodeURIComponent(email)+"&sid="+serverId+'&ip_bypass=1'
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
                url: 'http://api.cloudatcostapp.com/v1/'
            }).success(function(data, status, headers, config){
                callback(" Your current IP: " + data.requestIP);
            }).error(function(data, status, headers, config){
                callback("");
            });
        };

        var requestCloudproResources = function(APIKey, email, callback) {
            if (email === 'email@example.com' && APIKey === '123456789') {
                callback(200, {
                    "status": "ok",
                    "time": 1429120346,
                    "api": "v1",
                    "action": "resources",
                    "data": {
                        "total": {
                            "cpu_total": "8",
                            "ram_total": "8192",
                            "storage_total": "120"
                        },
                        "used": {
                            "cpu_used": "3",
                            "ram_used": "3072",
                            "storage_used": "90"
                        }
                    }
                });
            } else {
                $http({
                    method: 'GET',
                    url: 'https://panel.cloudatcost.com/api/v1/cloudpro/resources.php?key='+APIKey+'&login='+encodeURIComponent(email)+'&ip_bypass=1'
                }).success(function(data, status, headers, config){
                    callback(status, data);
                }).error(function(data, status, headers, config){
                    callback(status, data);
                });
            }
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
                            "data":[
                                {
                                    "ce_id":"74",
                                    "name":"FreeBSD-10-1-64bit"
                                },
                                {
                                    "ce_id":"28",
                                    "name":"Minecraft-CentOS-7-64bit"
                                },
                                {
                                    "ce_id":"27",
                                    "name":"Ubuntu-14.04.1-LTS-64bit"
                                },
                                {
                                    "ce_id":"26",
                                    "name":"CentOS-7-64bit"
                                },
                                {
                                    "ce_id":"25",
                                    "name":"Windows 2012 R2 64bit (BigDogs Only)"
                                },
                                {
                                    "ce_id":"24",
                                    "name":"Windows 2008 R2 64bit (BigDogs Only)"
                                },
                                {
                                    "ce_id":"21",
                                    "name":"Ubuntu 12.10 64bit"
                                },
                                {
                                    "ce_id":"23",
                                    "name":"Ubuntu 12.04.3 LTS 64bit"
                                },
                                {
                                    "ce_id":"15",
                                    "name":"CentOS 6.5 64bit (LAMP)"
                                },
                                {
                                    "ce_id":"14",
                                    "name":"CentOS 6.5 64bit (cPanel-WHM)"
                                },
                                {
                                    "ce_id":"10",
                                    "name":"CentOS 6.5 32bit"
                                },
                                {
                                    "ce_id":"13",
                                    "name":"CentOS 6.5 64bit"
                                },
                                {
                                    "ce_id":"9",
                                    "name":"Windows7 64bit (BigDogs Only)"
                                },
                                {
                                    "ce_id":"3",
                                    "name":"Debian 7.1 64bit"
                                },
                                {
                                    "ce_id":"2",
                                    "name":"Ubuntu-13.10-64bit"
                                },
                                {
                                    "ce_id":"1",
                                    "name":"CentOS 6.4 64bit"
                                },
                                {
                                    "ce_id":"75",
                                    "name":"Docker Ubuntu-14.04.1-LTS"
                                }
                            ]
                        }
                    );
                }
            } else {
                $http({
                    method: 'GET',
                    url: 'https://panel.cloudatcost.com/api/v1/list'+list+'.php?key='+APIKey+'&login='+encodeURIComponent(email)+'&ip_bypass=1'
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
                        if (dataResponse === "We are currently performing maintenance") {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: 'CloudAtCost is currently performing maintenance. Please try again later.'
                            });
                        }

                        if (status === 200) {
                            responseStatus.message = "";
                            _.each(dataResponse.data, function(data) {
                                data.chartData = {};
                                data.chartData.cpu = [
                                    {label: "CPU", value: Math.round((data.cpuusage/(data.cpu*100))*100), suffix: "%", color: "#4682B4", complementBrightness: 90}
                                ];
                                data.chartData.ram = [
                                    {label: "RAM", value: Math.round((data.ramusage/data.ram)*100), suffix: "%", color: "#DAA520", complementBrightness: 90}
                                ];
                                data.chartData.hd = [
                                    {label: "HD", value: Math.round((data.hdusage/data.storage)*100), suffix: "%", color: "#228B22", complementBrightness: 90}
                                ];
                            });
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
                                            requestCloudproResources(APIKey, email, function (status, data) {
                                                if (status == 200) {
                                                    responseStatus.message = "";
                                                    Cloudpro.update(data);
                                                    callback();
                                                } else {
                                                    getIp(function(data) {
                                                        responseStatus.message = errorMessage + data;
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else {
                                            getIp(function(data) {
                                                responseStatus.message = errorMessage + data;
                                                callback();
                                            });
                                        }
                                    });
                                } else {
                                    getIp(function(data) {
                                        responseStatus.message = errorMessage + data;
                                        callback();
                                    });
                                }
                            });
                        } else {
                            getIp(function(data) {
                                responseStatus.message = errorMessage + data;
                                callback();
                            });
                        }
                    });
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
            requestCloudproResources: function(callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                requestCloudproResources(APIKey, email, callback);
            },
            powerOperation: function(action, serverId, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTpowerOperation(email, APIKey, serverId, action, callback);
            },
            switchRunmode: function(mode, serverId, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTswitchRunmode(email, APIKey, serverId, mode, callback);
            },
            cloudproBuildServer: function(cpu, ram, storage, os, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTcloudproBuildServer(email, APIKey, cpu, ram, storage, os, callback);
            },
            cloudproDeleteServer: function(serverId, callback) {
                var email = dataStorage.getEmail();
                var APIKey = dataStorage.getAPIKey();
                POSTcloudproDeleteServer(email, APIKey, serverId, callback);
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

        return {
            saveEmail: function(email) {
                window.localStorage.setItem("email", AES.encrypt(email));
            },
            saveAPIKey: function(APIKey) {
                window.localStorage.setItem("APIKey", AES.encrypt(APIKey));
            },
            saveResponseTime: function(responseTime) {
                window.localStorage.setItem("responseTime", AES.encrypt(responseTime));
            },
            saveServers: function(servers) {
                window.localStorage.setItem("servers", AES.encrypt(JSON.stringify(servers)));
            },
            saveTasks: function(tasks) {
                window.localStorage.setItem("tasks", AES.encrypt(JSON.stringify(tasks)));
            },
            saveTemplates: function(templates) {
                window.localStorage.setItem("templates", AES.encrypt(JSON.stringify(templates)));
            },
            saveCloudpro: function(cloudpro) {
                window.localStorage.setItem("cloudpro", AES.encrypt(JSON.stringify(cloudpro)));
            },
            getEmail: function() {
                if (window.localStorage.getItem("email")) {
                    return AES.decrypt(window.localStorage.getItem("email"));
                } else {
                    return "";
                }
            },
            getAPIKey: function() {
                if (window.localStorage.getItem("APIKey")) {
                    return AES.decrypt(window.localStorage.getItem("APIKey"));
                } else {
                    return "";
                }
            },
            getResponseTime: function() {
                if (window.localStorage.getItem("responseTime")) {
                    return AES.decrypt(window.localStorage.getItem("responseTime"));
                } else {
                    return "";
                }
            },
            getServers: function() {
                if (window.localStorage.getItem("servers")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("servers"))) ? JSON.parse(AES.decrypt(window.localStorage.getItem("servers"))) : [];
                } else {
                    return [];
                }
            },
            getTasks: function() {
                if (window.localStorage.getItem("tasks")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("tasks"))) ? JSON.parse(AES.decrypt(window.localStorage.getItem("tasks"))) : [];
                } else {
                    return [];
                }
            },
            getTemplates: function() {
                if (window.localStorage.getItem("templates")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("templates"))) ? JSON.parse(AES.decrypt(window.localStorage.getItem("templates"))) : [];
                } else {
                    return [];
                }
            },
            getCloudpro: function() {
                if (window.localStorage.getItem("cloudpro")) {
                    return isJson(AES.decrypt(window.localStorage.getItem("cloudpro"))) ? JSON.parse(AES.decrypt(window.localStorage.getItem("cloudpro"))) : [];
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
            },
            updateStorage: function(callback) {
                console.log("Email" + this.getEmail());
                this.saveEmail(this.getEmail());
                this.saveAPIKey(this.getAPIKey());

                localStorage.removeItem("responseTime");
                localStorage.removeItem("servers");
                localStorage.removeItem("tasks");
                localStorage.removeItem("templates");
                localStorage.removeItem("cloudpro");

                callback();
            }
        };
    })

    .factory('cacStatus', function($http) {
        var getStatus = function(callback) {
            $http({
                method: 'GET',
                url: 'http://api.cloudatcostapp.com/v1/'
            }).success(function(data, status, headers, config){
                callback(data.cacStatus);
            }).error(function(data, status, headers, config){
                callback([]);
            });
        };

        return {
            getStatus: getStatus
        };
    })

    .factory('AES', function() {
        var passphrase = "SECRET_PASS_PHRASE";

        var iterationCount = 1;
        var keySize = 128;
        var iv = "6edmJL==2c3#2@t6HMeWNLu{NY6z4U";
        var salt = "v?BBKmLuPcxEaETj=Ujx3/Tm6{8uY9zwXm2GfsGdHT6WHtEH]84k+8n26kj9}EWX[AFQLi]U63J)mPme";

        var aesUtil = new AesUtil(keySize, iterationCount);

        var decryptLegacy = function(text) {
            var aesUtilLegacy = new AesUtil(keySize, 1000);
            return aesUtilLegacy.decrypt(salt, iv, passphrase, text);
        };

        return {
            encrypt: function(text) {
                return aesUtil.encrypt(salt, iv, passphrase, text);
            },
            decrypt: function(text) {
                try {
                    if (!localStorage.getItem('appVersion')) {
                        return decryptLegacy(text);
                    }
                    return aesUtil.decrypt(salt, iv, passphrase, text);
                } catch (e) {
                    return decryptLegacy(text);
                }
            }
        };
    });
