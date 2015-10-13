var app = angular.module("goApp", []);
app.service("mirrors", function () {
    return [];
});
app.controller("MainCtrl", function ($scope, $rootScope) {
    var threadCount = 3,
        timeout = 2000,
        testUrl = "/images/srpr/logo11w.png",
        originalHosts =  ["gg.wen.lu", "www.ggooo.net","g.yh.gs","gg.kfd.me","guge.in","hisbig.com","g.yon.hk","g.weme.so","gs.awei.me","www.guge.link","www.guge119.com","google-hk.wewell.net","google.sidney-aldebaran.me","www.google52.com","go.hibenben.com","www.guge.date","www.guge.click","g.searcher.top","sslpxy.com","gg.searcher.top","gg.cellmean.com","go.hibenben.com","www.google52.com","www.guge119.com","www.googlestable.cn","google.sidney-aldebaran.me"],
        hosts = angular.copy(originalHosts),
        hostCount = hosts.length;

    if(window.localStorage && window.localStorage.getItem("hosts")){
        hosts = window.localStorage.getItem("hosts").split(",");
        hostCount = 3;
    }
    $scope.google = {
        connected: false,
        ip: ""
    };
    $rootScope.mirrors = [];

    $scope.runTest = function () {
        var i = 0;
        if(!hosts.length){
            $scope.hostFound = true;
        }
        while(i<threadCount && !$scope.hostFound){
            var host = hosts.shift();
            if(host){
                var mirror = {
                    host: host,
                    testUrl: "//" + host + testUrl + "?" + new Date().getTime(),
                    start: new Date().getTime(),
                    status: "pending"
                };
                $scope.mirrors.push(mirror);
            }
            i ++;
        }
    };

    //re-test all hosts
    $scope.reset = function () {
        localStorage.removeItem("hosts");
        hosts = angular.copy(originalHosts);
        hostCount = hosts.length;
        $scope.hostFound = false;
        $rootScope.mirrors = [];
    };

    $rootScope.$watch("mirrors", function () {
        var finishedTests = [],
            pendingTests = [];
        $rootScope.mirrors.forEach(function (mirror) {
           if(mirror.status == "fast" || mirror.status == "slow"){
               finishedTests.push(mirror);
           }else if(new Date().getTime() - mirror.start < timeout){ //not timeout
               pendingTests.push(mirror);
           }else{
               mirror.status = "timeout";
           }
        });
        finishedTests.sort(function (a, b) {
            return a.timecost - b.timecost;
        });
        var topMirror = finishedTests[0];

        if(topMirror){
            $scope.google.ip = topMirror.host;
            $scope.google.connected = true;
        }

        if(localStorage.getItem("hosts") && finishedTests.length >= hostCount){
            $scope.hostFound = true;
        }

        if($rootScope.mirrors.length >= hosts.length){
            window.localStorage.hosts = finishedTests.map(function (mirror) {
                return mirror.host;
            }).join(",");
        }

        if(pendingTests.length < threadCount){
            $scope.runTest();
        }
    }, true);

    $scope.toggleDetail = function () {
      $scope.showDetail = !$scope.showDetail;
    };

    $scope.search = function () {
        var key = $scope.key ? $scope.key.replace(/ /g, "+") : "";
        window.open("http://" + $scope.google.ip + "/search?query=" + key);
    };
});

app.directive('imageLoad', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            element.bind('load', function() {
                scope.$apply(function () {
                    var currentHost = attrs.imageLoad;
                    var mirror = $rootScope.mirrors.filter(function (mirror) {
                        return mirror.host == currentHost;
                    }).pop();
                    var ms = new Date().getTime() - mirror.start;
                    if(mirror.status == "pending"){
                        mirror.status = ms < 1000 ? "fast" : "slow";
                    }
                    mirror.timecost = ms;
                });

            });

            element.bind('error', function() {
                scope.$apply(function () {
                    var currentHost = attrs.imageLoad;
                    var mirror = $rootScope.mirrors.filter(function (mirror) {
                        return mirror.host == currentHost;
                    }).pop();
                    mirror.status = "timeout";
                });

                return false;
            });
        }
    };
})
.directive('enter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enter);
                });
                event.preventDefault();
            }
        });
    };
});
