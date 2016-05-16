angular.module('starter.controllers', ['n3-pie-chart', 'angularMoment'])

    .controller('DashCtrl', function($scope, $ionicHistory, $ionicPopover, $ionicLoading, dataRequestService, dataStorage, Servers, Tasks, Templates) {

        $scope.showLoading = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hideLoading = function(){
            $ionicLoading.hide();
        };

        $scope.accounts = dataStorage.getAccounts();

        $ionicPopover.fromTemplateUrl('templates/accounts-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.accounts = dataStorage.getAccounts();
            $scope.popover.show($event);
        };

        $scope.activateAccount = function(account) {
            dataStorage.saveEmail(account.email);
            dataStorage.saveAPIKey(account.APIKey);
            $scope.showLoading();
            $scope.refresh(function() {
                $scope.hideLoading();
            });
            $scope.popover.hide();
        };

        $scope.refresh = function(callback) {
            dataRequestService.getData(function() {
                $ionicHistory.clearHistory();
                $scope.$broadcast('scroll.refreshComplete');
                if (callback) {
                    callback();
                }
            });
        };

        if (!window.localStorage.getItem('appVersion')) {
            dataStorage.updateStorage(function() {
                $scope.refresh();
                window.localStorage.setItem('appVersion', 1);
            });
        }

        $scope.getTemplateImage = Templates.getTemplateImage;

        $scope.status = false;
        $scope.servers = Servers.data;
        $scope.tasks = Tasks.data;
        $scope.templates = Templates.data;
        $scope.status = dataRequestService.status;
        $scope.chartOptions = {thickness: 10, mode: "gauge", total: 100};
    })

    .controller('ServerCtrl', function($scope, $ionicHistory, $ionicPopover, $ionicLoading, dataRequestService, dataStorage, Servers, Templates) {
        $scope.showLoading = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hideLoading = function(){
            $ionicLoading.hide();
        };

        $scope.accounts = dataStorage.getAccounts();

        $ionicPopover.fromTemplateUrl('templates/accounts-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.accounts = dataStorage.getAccounts();
            $scope.popover.show($event);
        };

        $scope.activateAccount = function(account) {
            dataStorage.saveEmail(account.email);
            dataStorage.saveAPIKey(account.APIKey);
            $scope.showLoading();
            $scope.refresh(function() {
                $scope.hideLoading();
            });
            $scope.popover.hide();
        };

        $scope.refresh = function(callback) {
            dataRequestService.getData(function() {
                $ionicHistory.clearCache();
                $scope.$broadcast('scroll.refreshComplete');
                if (callback) {
                    callback();
                }
            });
        };

        $scope.servers = Servers.data;
        $scope.data = {
            searchQuery: ""
        };

        $scope.getTemplateImage = Templates.getTemplateImage;

        $scope.clearSearch = function() {
            $scope.data.searchQuery = "";
        };
    })

    .controller('ServerDetailCtrl', function($scope, $stateParams, $ionicHistory, $ionicPopup, $cordovaClipboard, dataRequestService, Servers, Tasks) {
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

        $scope.switchRunmode = function(serverId, currentRunmode) {
            var newMode = currentRunmode == 'Safe' ? 'normal' : 'safe';

            var confirmPopup = $ionicPopup.confirm({
                title: 'Switch Runmode',
                template: 'Are you sure you want to the runmode to ' + newMode + '?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    dataRequestService.switchRunmode(newMode, serverId, function(data){
                        $ionicPopup.alert({
                            title: 'Switch Runmode',
                            template: 'Runmode will be switched'
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

        $scope.deleteServer = function(serverId) {
            $scope.data = {};
            $scope.deletingServer = false;
            var confirmationText = 'yes';

            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.confirmationText">',
                title: 'Are you sure you want to delete this server?',
                subTitle: 'Deleting your server cannot be undone. Please enter "'+confirmationText+'" to confirm:<br />',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            if (!($scope.data.confirmationText.toLowerCase() === confirmationText)) {
                                //don't allow the user to close unless he enters something new
                                e.preventDefault();
                            } else {
                                $scope.deletingServer = true;
                                dataRequestService.cloudproDeleteServer(serverId, function(data) {
                                    $scope.deletingServer = false;
                                    $ionicPopup.alert({
                                        title: 'Success!',
                                        template: 'Server has been deleted.'
                                    });

                                    // Go back to servers
                                    $ionicHistory.goBack(-1);
                                    // Refresh servers
                                    dataRequestService.getData(function(){});
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

        $scope.filterAttributes = function(server) {
            var result = {};
            _.each(server, function(value, key) {
                if (key !== 'chartData') {
                    result[key] = value;
                }
            });
            return result;
        };

        $scope.copyTextToClipboard = function(value) {
            $cordovaClipboard.copy(value).then(function() {
                $ionicPopup.alert({
                    title: 'Copied to clipboard:',
                    template: value
                });
            }, function() {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Value could not be copied to clipboard'
                });

            });
        };

    })

    .controller('CloudproCtrl', function($scope, $state, $ionicPopup, $ionicHistory, $ionicPopover, $ionicLoading, dataStorage, dataRequestService, Templates, Cloudpro) {
        $scope.showLoading = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hideLoading = function(){
            $ionicLoading.hide();
        };

        $scope.accounts = dataStorage.getAccounts();

        $ionicPopover.fromTemplateUrl('templates/accounts-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            $scope.accounts = dataStorage.getAccounts();
            $scope.popover.show($event);
        };

        $scope.activateAccount = function(account) {
            dataStorage.saveEmail(account.email);
            dataStorage.saveAPIKey(account.APIKey);
            $scope.showLoading();
            $scope.refresh(function() {
                $scope.hideLoading();
            });
            $scope.popover.hide();
        };

        $scope.refresh = function(callback) {
            dataRequestService.getData(function() {
                $ionicHistory.clearCache();
                $scope.$broadcast('scroll.refreshComplete');
                if (callback) {
                    callback();
                }
            });
        };

        $scope.cloudproResources = {};

        $scope.cloudproResources.options = [
            {
                name: "CPU",
                options: [
                    {id: 1, label: 1}
                ]
            },
            {
                name: "RAM",
                options: [
                    {id: 512, label: "512 MB"}
                ]
            },
            {
                name: "HD",
                options: [
                    {id: 10, label: "10 GB"}
                ]
            },
            {
                name: "Template",
                options: []
            }
        ];

        var updateOptions = function() {
            // TODO keep standard values (from above) if there are no more resources available
            if ($scope.cloudpro.response.hasOwnProperty('data')) {
                $scope.cloudproResources.options[0].options = [];
                for(var x = 1; x <= $scope.cloudpro.response.data.total.cpu_total - $scope.cloudpro.response.data.used.cpu_used; x++) {
                    $scope.cloudproResources.options[0].options.push({id: x, label: x});
                }
                $scope.cloudproResources.options[1].options = [];
                for(x = 1; x <= Math.floor(($scope.cloudpro.response.data.total.ram_total - $scope.cloudpro.response.data.used.ram_used) / 512); x++) {
                    $scope.cloudproResources.options[1].options.push({id: x*512, label: (x*512) + " MB"});
                }
                $scope.cloudproResources.options[2].options = [];
                for(x = 2; x <= Math.floor(($scope.cloudpro.response.data.total.storage_total - $scope.cloudpro.response.data.used.storage_used) / 5); x++) {
                    $scope.cloudproResources.options[2].options.push({id: x*5, label: (x*5) + " GB"});
                }
                $scope.cloudproResources.options[0].newServer = $scope.cloudproResources.options[0].options[0];
                $scope.cloudproResources.options[1].newServer = $scope.cloudproResources.options[1].options[0];
                $scope.cloudproResources.options[2].newServer = $scope.cloudproResources.options[2].options[0];
            }
        };

        $scope.cloudpro = Cloudpro.data;

        // Update detail view when new data is available
        $scope.$watch('cloudpro', function () {
            updateOptions();
        }, true);

        updateOptions();

        var sortedTemplates = _.sortBy(Templates.data.response.data, function(template){
            return template.name;
        });

        _.each(sortedTemplates, function(data) {
            $scope.cloudproResources.options[3].options.push({id: data.ce_id, label: data.name});
        });
        
        $scope.cloudproResources.options[3].newServer = $scope.cloudproResources.options[3].options[0];

        $scope.buildServer = function() {
            $scope.buildingServer = false;
            var confirmPopup = $ionicPopup.confirm({
                title: 'Build new server',
                template: 'Are you sure you want to build a new pro server with the following resources?<br />' +
                'CPU: ' + $scope.cloudproResources.options[0].newServer.id + '<br />' +
                'RAM: ' + $scope.cloudproResources.options[1].newServer.id + ' MB<br />' +
                'HD: ' + $scope.cloudproResources.options[2].newServer.id + ' GB<br />' +
                'Template: ' + $scope.cloudproResources.options[3].newServer.label + '<br />'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $scope.buildingServer = true;
                    dataRequestService.cloudproBuildServer($scope.cloudproResources.options[0].newServer.id, $scope.cloudproResources.options[1].newServer.id, $scope.cloudproResources.options[2].newServer.id, $scope.cloudproResources.options[3].newServer.id, function() {
                        $scope.buildingServer = false;
                        $ionicPopup.alert({
                            title: 'Success!',
                            template: 'Your server will be built'
                        });
                        // Refresh servers
                        dataRequestService.getData(function(){});
                    });
                }
            });
        };
    })

    .controller('AccountCtrl', function($scope, $state, $ionicPopup, $ionicModal, $cordovaBarcodeScanner, dataRequestService, dataStorage, Servers, Tasks, Templates, cacStatus) {
        $scope.currentIP = "";

        $scope.accounts = dataStorage.getAccounts();

        $scope.cacStatus = [];

        cacStatus.getStatus(function(data) {
            $scope.cacStatus = data;
        });

        $scope.email = dataStorage.getEmail();

        // Use this method if modal is open, so when user clicks save or reads QR code
        $scope.saveAccountModal = function(newAccount) {
            $scope.modal.hide();
            $scope.saveAccount(newAccount);
        };

        $scope.saveAccount = function(newAccount) {
            dataStorage.saveAccount(newAccount);
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
                    $scope.email = "";
                    $scope.APIKey = "";
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
                if (imageData.text) {
                    // todo: verify input data
                    var text = imageData.text.split(',');
                    $scope.saveAccountModal({email: text[1], APIKey: text[0]});
                }
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

        $scope.showAccountModal = function() {
            $scope.modal.show();
        };

        $ionicModal.fromTemplateUrl('templates/add-account-modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        if ($scope.accounts.length === 0) {
            var email = dataStorage.getEmail();
            var APIKey = dataStorage.getAPIKey();
            if(email.length > 0 && APIKey.length > 0) {
                $scope.saveAccount({email: email, APIKey: APIKey});
            }
        }

    })

    .controller('AccountDetailCtrl', function($scope, $state, $stateParams, $ionicPopup, dataStorage, dataRequestService) {
        console.log($stateParams.email);
        var account = dataStorage.getAccountByEmail($stateParams.email);
        if (!account.email) {
            $state.transitionTo("tab.account");
        }
        $scope.email = account.email;
        $scope.APIKey = account.APIKey;

        $scope.deleteAccount = function() {
            dataStorage.deleteAccount(account);
            $state.transitionTo("tab.account");
        };

        $scope.makeActive = function() {
            dataStorage.saveEmail(account.email);
            dataStorage.saveAPIKey(account.APIKey);
            dataRequestService.getData(function() {});
            $state.transitionTo("tab.dash");
        }
    });