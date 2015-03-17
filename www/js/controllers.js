angular.module('starter.controllers', ['angularCharts', 'angularMoment'])

    .controller('DashCtrl', function($scope, dataRequestService, dataStorage, Servers, Tasks, Templates) {
        $scope.status = false;
        $scope.servers = Servers.data;
        $scope.tasks = Tasks.data;
        $scope.templates = Templates.data;
        $scope.status = dataRequestService.status;

        $scope.refresh = function() {
            dataRequestService.getData(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };


        $scope.data = {
            data: [{
                x: "Used",
                //y: [$scope.servers.response.data[0].ramusage],
                y: [100],
                tooltip: "test"
            }, {
                x: "Free",
                //y: [$scope.servers.response.data[0].ram - $scope.servers.response.data[0].ramusage],
                y: [100],
                tooltip: "test"
            }]
        };

        $scope.chartType = 'pie';

        $scope.config = {
            labels: true,
            tooltips: true,
            title: "Memory",
            legend: {
                display: true,
                position: 'left'
            },
            innerRadius: 0
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
        $scope.template_images[26] = 'centos';
        $scope.template_images[27] = 'ubuntu';
        $scope.template_images[15] = 'centos';
        $scope.template_images[21] = 'ubuntu';
        $scope.template_images[23] = 'ubuntu';
        $scope.template_images[24] = 'windows-server-2008';
        $scope.template_images[25] = 'windows-server-2012';
        $scope.template_images[14] = 'centos';
        $scope.template_images[13] = 'centos';
        $scope.template_images[10] = 'centos';
        $scope.template_images[3] = 'debian';
        $scope.template_images[9] = 'windows-7';
        $scope.template_images[2] = 'ubuntu';
        $scope.template_images[1] = 'centos';
        $scope.template_images[28] = 'minecraft';
        $scope.template_images[16] = 'ubuntu';

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
        $scope.server = Servers.get($stateParams.serverId);
        $scope.serverTasks = Tasks.get($stateParams.serverId);

        $scope.ServerPowerOn = function(serverId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Power On Server',
                template: 'Are you sure you want to power on this server?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    dataRequestService.powerOperation('poweron', serverId, function(data){
                        alert(data);
                        console.log(data);

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
                        alert(data.action);
                        alert(data.result);
                        console.log(data);

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
                        alert(data.action);
                        alert(data.result);
                        console.log(data);
                    });
                }
            });
        };
        $scope.getConsole = function(serverId) {
            dataRequestService.getConsole(serverId, function(data) {
                window.open(data.console, '_system', 'location=yes');
            });
        };
    })

    .controller('AccountCtrl', function($scope, $ionicPopup, dataRequestService, dataStorage, Servers, Tasks, Templates) {
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
                    dataStorage.clearStorage();
                    Servers.clear();
                    Tasks.clear();
                    Templates.clear();
                    localStorage.clear();
                }
            });
        };
        $scope.getIP = function() {
            dataRequestService.getCurrentIP(function(data) {
                $scope.currentIP = data;
            });
        };

    });