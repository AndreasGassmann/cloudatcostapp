angular.module('starter.controllers', ['n3-pie-chart', 'angularMoment'])

    .controller('DashCtrl', function($scope, $ionicHistory, dataRequestService, dataStorage, Servers, Tasks, Templates) {
        $scope.status = false;
        $scope.servers = Servers.data;
        $scope.tasks = Tasks.data;
        $scope.templates = Templates.data;
        $scope.status = dataRequestService.status;

        $scope.chartData = [];

        $scope.getChartData = function(type, serverId) {
            if (!$scope.chartData[serverId]) {
                var server = Servers.get(serverId);
                $scope.chartData[serverId] = {};
                $scope.chartData[serverId].cpu = [
                    {label: "CPU", value: Math.round((server.cpuusage/(server.cpu*100))*100), suffix: "%", color: "steelblue"}
                ];
                $scope.chartData[serverId].ram = [
                    {label: "RAM", value: Math.round((server.ramusage/server.ram)*100), suffix: "%", color: "goldenrod"}
                ];
                $scope.chartData[serverId].hd = [
                    {label: "HD", value: Math.round((server.hdusage/server.storage)*100), suffix: "%", color: "forestgreen"}
                ];
            }
            return type === 'CPU' ?
                $scope.chartData[serverId].cpu :
                type === 'RAM' ?
                    $scope.chartData[serverId].ram :
                    $scope.chartData[serverId].hd;
        };

        $scope.chartOptions = {thickness: 10, mode: "gauge", total: 100};

        $scope.refresh = function() {
            dataRequestService.getData(function() {
                $ionicHistory.clearHistory();
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
    })

    .controller('ServerCtrl', function($scope, dataRequestService, Servers) {
        $scope.refresh = function() {
            dataRequestService.getData(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.servers = Servers.data;

        $scope.template_images = [];
        $scope.template_images[74] = 'freebsd';
        $scope.template_images[26] = 'centos';
        $scope.template_images[27] = 'ubuntu';
        $scope.template_images[15] = 'centos';
        $scope.template_images[21] = 'ubuntu';
        $scope.template_images[23] = 'ubuntu';
        $scope.template_images[24] = 'windows-server-2008';
        $scope.template_images[25] = 'windows-server-2012';
        $scope.template_images[15] = 'centos';
        $scope.template_images[14] = 'centos';
        $scope.template_images[13] = 'centos';
        $scope.template_images[10] = 'centos';
        $scope.template_images[3] = 'debian';
        $scope.template_images[9] = 'windows-7';
        $scope.template_images[2] = 'ubuntu';
        $scope.template_images[1] = 'centos';
        $scope.template_images[28] = 'minecraft';
        $scope.template_images[16] = 'ubuntu';
        $scope.template_images[75] = 'docker';

        $scope.getTemplateImage = function(id) {
            if ($scope.template_images[id]) {
                return 'img/'+$scope.template_images[id]+'.png';
            } else {
                //TODO: add unknown image
                return 'img/ubuntu.png';
            }
        };
    })

    .controller('ServerDetailCtrl', function($scope, $stateParams, $ionicPopup, dataRequestService, Servers, Tasks) {
        $scope.server = {};
        $scope.allServers = Servers.data;
        $scope.allTasks = Tasks.data;
        $scope.server.server = _.find($scope.allServers.response.data, function(server){ return server.id === $stateParams.serverId; });
        $scope.server.tasks = _.sortBy(_.filter($scope.allTasks.response.data, function(task){ return task.serverid === $stateParams.serverId; }), 'finishtime');

        // Update detail view when new data is available
        $scope.$watch('allServers', function (newVal, oldVal) {
            $scope.server.server = _.find($scope.allServers.response.data, function(server){ return server.id === $stateParams.serverId; });
            $scope.server.tasks = _.sortBy(_.filter($scope.allTasks.response.data, function(task){ return task.serverid === $stateParams.serverId; }), 'finishtime');
        }, true);

        $scope.ServerPowerOn = function(serverId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Power On Server',
                template: 'Are you sure you want to power on this server?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    dataRequestService.powerOperation('poweron', serverId, function(data){
                        $ionicPopup.alert({
                            title: 'Power On',
                            template: 'Your server will now power on'
                        });
                    });
                }
            });
        };
        $scope.ServerPowerOff = function(serverId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Power Off Server',
                template: 'Are you sure you want to shut down this server?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    dataRequestService.powerOperation('poweroff', serverId, function(data){
                        $ionicPopup.alert({
                            title: 'Power Off',
                            template: 'Your server will now power off'
                        });
                    });
                }
            });
        };
        $scope.ServerReset = function(serverId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Restart Server',
                template: 'Are you sure you want to restart this server?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    dataRequestService.powerOperation('reset', serverId, function(data){
                        $ionicPopup.alert({
                            title: 'Restart',
                            template: 'Your server will now restart'
                        });
                    });
                }
            });
        };

        $scope.renameServer = function(serverId, currentServerName) {
            $scope.data = {};

            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.newServername">',
                title: 'Enter new server name',
                subTitle: 'Your current server name is:<br />'+currentServerName,
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.newServername || $scope.data.newServername === currentServerName) {
                                //don't allow the user to close unless he enters something new
                                e.preventDefault();
                            } else {
                                dataRequestService.renameServer(serverId, $scope.data.newServername, function(data) {
                                    $ionicPopup.alert({
                                        title: 'Success!',
                                        template: 'Your server name has been changed'
                                    });
                                });
                            }
                        }
                    }
                ]
            });
        };

        $scope.modifyDNS = function(serverId, currentHostname) {
            $scope.data = {};

            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.newHostname">',
                title: 'Enter new hostname',
                subTitle: 'Your current hostname is:<br />'+currentHostname,
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.newHostname || $scope.data.newHostname === currentHostname) {
                                //don't allow the user to close unless he enters something new
                                e.preventDefault();
                            } else {
                                dataRequestService.modifyDNS(serverId, $scope.data.newHostname, function(data) {
                                    $ionicPopup.alert({
                                        title: 'Success!',
                                        template: 'Your reverse DNS has been changed'
                                    });
                                });
                            }
                        }
                    }
                ]
            });
        };

        $scope.getConsole = function(serverId) {
            dataRequestService.getConsole(serverId, function(data) {
                window.open(data.console, '_system', 'location=yes');
            });
        };
    })

    .controller('AccountCtrl', function($scope, $state, $ionicPopup, $cordovaBarcodeScanner, dataRequestService, dataStorage, Servers, Tasks, Templates) {
        $scope.currentIP = "";

        $scope.settings = {
            email: dataStorage.getEmail(),
            APIKey: dataStorage.getAPIKey(),
            showAPIKey: false
        };

        $scope.saveData = function() {
            dataStorage.saveEmail($scope.settings.email);
            dataStorage.saveAPIKey($scope.settings.APIKey);
            dataRequestService.getData(function() {});
            $state.transitionTo("tab.dash");
        };
        $scope.deleteData = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete Data',
                template: 'Are you sure you want to delete all the data from this device?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $scope.settings.email = "";
                    $scope.settings.APIKey = "";
                    $scope.currentIP = "";
                    dataRequestService.clear();
                    dataStorage.clearStorage();
                    Servers.clear();
                    Tasks.clear();
                    Templates.clear();
                    localStorage.clear();

                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Your account has been deleted from this device'
                    });

                    window.location.reload(); // Reload entire app to reset views
                }
            });
        };
        $scope.getIP = function() {
            dataRequestService.getCurrentIP(function(data) {
                $scope.currentIP = data;
            });
        };

        $scope.refreshApp = function() {
            window.location.reload(); // Reload entire app to reset views
        };

        $scope.scanBarcode = function() {
            $cordovaBarcodeScanner.scan().then(function(imageData) {
                var text = imageData.text.split(',');
                $scope.settings.email = text[1];
                $scope.settings.APIKey = text[0];
                $scope.saveData();
                //console.log("Barcode Format -> " + imageData.format);
                //console.log("Cancelled -> " + imageData.cancelled);
            }, function(error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'There was an error. Please try again.'
                });
                //console.log("An error happened -> " + error);
            });
        };

    });