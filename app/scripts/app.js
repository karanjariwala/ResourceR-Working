'use strict';
var app = angular.module('confusionApp', ['ui.bootstrap', 'ngCookies']);
app.config(function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
});
app.controller('MenuController', MenuController);
MenuController.$inject = ['$scope', '$uibModal', '$cookies', 'team', 'Availability'];

function MenuController($scope, $uibModal, $cookies, team, Availability) {
    $scope.tab = 1;
    $scope.filtText = 'clinical';
    $scope.showDetails = true;
    $scope.assoFilt = 'Akash';
    //÷$scope.team = team;
    var team_members = []
    for (var i = 0; i < team.length; i++) {
        team_members.push(team[i].name);
    }
    console.log(team_members);
    Availability.fetch({ team_members: team_members })
        .then(function(response) {
            console.log("Here");
            console.log(response);
            for (var i = 0; i < response.length; i++) {
                for (var j = 0; j < team.length; j++) {
                    if (team[j].name === response[i].name) {
                        team[j].nextWeeksAvail = response[i].week;
                        team[j].quartersAvail = response[i].quarter;
                        break;
                    }
                }
            }
            $scope.team = team;

        }, function(error) {
            console.log(error);
        });
    //    $cookies.putObject('karan', $scope.team[0]);
    //    $cookies.putObject('akash', $scope.team[1]);
    //    $cookies.putObject('neha', $scope.team[2]);
    //    $scope.team[0] = $cookies.getObject('karan');
    $scope.hours;
    $scope.selectAsso = function(name) {
        $scope.assoFilt = name;
        // console.log($scope.assoFilt);
    };
    $scope.assoSelected = function() {
        console.log($scope.assoFilt)
        return $scope.assoFilt;
    };
    $scope.select = function(setTab) {
        $scope.tab = setTab;
        if (setTab === 2) {
            $scope.filtText = "financial";
        } else if (setTab === 3) {
            $scope.filtText = "data";
        } else if (setTab === 4) {
            $scope.filtText = "bridge";
        } else {
            $scope.filtText = "clinical";
        }
    };
    $scope.isSelected = function(checkTab) {
        return ($scope.tab === checkTab);
    };
    $scope.toggleDetails = function() {
        $scope.showDetails = !$scope.showDetails;
    };
    $scope.getAvail = function(hours) {
        return ((Number($scope.hours) / 40) * 100)
    };
    $scope.openModal = function(name) {
        console.log(name);
        var modalInstance = $uibModal.open({
            templateUrl: 'myModalContent.html',
            controller: 'AssignController',
            size: 'md',
            resolve: {
                name: function() {
                    return name
                }

            }
        });
        modalInstance.result.then(function(selectedItem) {
            console.log(selectedItem);
            if (selectedItem !== undefined) {
                let objindex = 0;
                var arr = $scope.team.filter(function(item, index) {
                    if (item.name === name) {
                        objindex = index;
                        return true;
                    }
                });
                console.log(objindex);
                $scope.team[objindex].nextWeeksAvail = selectedItem.week;
                $scope.team[objindex].quartersAvail = selectedItem.quarter;
                //                $cookies.putObject('karan', $scope.team[objindex]);
                //                console.log($cookies.getObject('karan'));
            } else {
                console.log("Just a cancel");
            }
        }, function(error) {
            console.info('Modal dismissed at: ' + new Date() + error);
        });
    };
    $scope.aboutMeModal = function(name) {
        //console.log(name);
        var arr = $scope.team.filter(function(item) {
            if (item.name === name) return true;
        });
        console.log(arr);
        var modalInstance = $uibModal.open({
            templateUrl: 'aboutMeModal.html',
            controller: 'AboutMeController',
            size: 'md',
            resolve: {
                obj: function() {
                    return arr[0];
                },
                text: function() {
                    return $scope.filtText;
                }
            }
        });
    };



}
app.controller('AboutMeController', AboutMeController);
app.controller('AssignController', AssignController);
AboutMeController.$inject = ['$scope', '$uibModalInstance', 'obj', 'text'];
AssignController.$inject = ['$scope', '$uibModalInstance', 'Availability', 'name'];

function AboutMeController($scope, $uibModalInstance, obj, text) {
    $scope.asso1 = obj;
    $scope.filtText = text;
    $scope.cancel = function() {
        $uibModalInstance.close('cancel');
    }
}


function AssignController($scope, $uibModalInstance, Availability, name) {
    console.log("Saras");
    $scope.proceed = false;

    console.log($scope.filtText);
    $scope.confirmPass = function() {
        if ("outstanding" === $scope.password) {
            $scope.proceed = true;
        } else {
            $scope.proceed = false;
        }
    }
    $scope.done = function() {
        console.log($scope.weekAvail);
        console.log($scope.quarterAvail);
        var object = {
            week: $scope.weekAvail,
            quarter: $scope.quarterAvail,
            name: name
        };
        console.log(object);
        Availability.save(object)
            .then(function(response) {
                console.log("Aww Yeah!!!");
                $uibModalInstance.close(object);
            }, function(error) {
                console.log("Ohh Shit!!!");
            });

    };
    $scope.cancel = function() {
        $uibModalInstance.close();
    }
}

app.factory('Config', function() {
    return {
        // apiurl: 'http://localhost:5040',
        apiurl : 'http://api.hacknhelp.com'
    }
});
app.service('Availability', Availability);

Availability.$inject = ['Config', '$http', '$q'];

function Availability(Config, $http, $q) {
    this.save = function(data) {
        console.log("Here");
        return $http.post(Config.apiurl + '/save', data)
            .then(function(response) {
                console.log("Here also");
                return response.data;
            }, function(error) {
                console.log(error);
                return $q.reject(error.data);
            });
    };

    this.fetch = function(data) {
        return $http.post(Config.apiurl + '/fetch', data)
            .then(function(response) {
                return response.data;
            }, function(error) {
                return $q.reject(error.data);
            });
    };
};
