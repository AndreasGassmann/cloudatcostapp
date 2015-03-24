angular.module('starter.controllers', ['n3-pie-chart', 'angularMoment'])

    .controller('DashCtrl', function($scope, dataRequestService, dataStorage, Servers, Tasks, Templates) {
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
                console.log(server);
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

    .controller('ServerDetailCtrl', function($scope, $stateParams, $ionicPopup, dataRequestService, detailServer) {
        $scope.server = detailServer.get($stateParams.serverId);

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
        $scope.getConsole = function(serverId) {
            dataRequestService.getConsole(serverId, function(data) {
                window.open(data.console, '_system', 'location=yes');
            });
        };
    })

    .controller('AccountCtrl', function($scope, $ionicPopup, dataRequestService, dataStorage, Servers, Tasks, Templates, detailServer) {
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
            $ionicPopup.alert({
                title: 'Saved!',
                template: 'Your credentials have been saved. Check to Dashboard to see if it worked.'
            });
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
                    dataRequestService.clear();
                    dataStorage.clearStorage();
                    Servers.clear();
                    Tasks.clear();
                    Templates.clear();
                    detailServer.clear();
                    localStorage.clear();

                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Your account has been deleted from this device'
                    });

                }
            });
        };
        $scope.getIP = function() {
            dataRequestService.getCurrentIP(function(data) {
                $scope.currentIP = data;
            });
        };

    });