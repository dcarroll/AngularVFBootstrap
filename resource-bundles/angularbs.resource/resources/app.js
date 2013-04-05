var app = angular.module('project', ['AngularForce', 'AngularForceObjectFactory', 'Opportunity']);

app.constant('SFConfig', {'sfLoginURL': 'https://login.salesforce.com/',
    'consumerKey': '3MVG9A2kN3Bn17huxQ_nFw2X9UgjpxsCn.CZgify3keA9sgl.VASp6A5HxfUFUtKH9IN7sgBH4ow7aS1WLYaa',
    'oAuthCallbackURL': 'http://localhost:3000'
}); 

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/AngularBSIndex', { templateUrl: 'apex/AngularBSList' });
    $routeProvider.when('/', { templateUrl: 'apex/AngularBSList' });
    $routeProvider.when('/AngularBSEdit/:oppId', { templateUrl: 'apex/AngularBSEdit'});
    $routeProvider.when('/AngularBSDetail/:oppId', { templateUrl: 'apex/AngularBSDetail'});
    //$routeProvider.otherwise({redirectTo: '/'});
    
});
app.run(function($rootScope, $location  ) {
    $rootScope.$on('$routeChangeStart', function(scope, newRoute) {
        if (!newRoute) return;
        //$rootScope.templates = newRoute.$route.templates;
        //$rootScope.layoutController = newRoute.$route.controller;
    });

});
/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Opportunity' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
angular.module('Opportunity', []).factory('Opportunity', function (AngularForceObjectFactory) {
    var Opportunity = AngularForceObjectFactory({type: 'Opportunity', fields: ['Name', 'ExpectedRevenue', 'StageName', 'CloseDate', 'Id'], where: 'WHERE IsWon = TRUE'});
    return Opportunity;
});

function ListCtrl($scope, AngularForce, Opportunity, $route, $routeParams, $location) {
    console.log($location.path() + "\n" + $route.current.templateUrl + "\n" + $route.current.params);
    AngularForce.globalLogin(function () {
        Opportunity.query(function (data) {
            $scope.opportunities = data.records;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    });
}


function CreateCtrl($scope, $location, Opportunity) {
    $scope.save = function () {
        Opportunity.save($scope.opp, function (opp) {
            var p = opp;
            $scope.$apply(function () {
                $location.path('/edit/' + p.id);
            });
        });
    }
}

function EditCtrl($scope, AngularForce, $location, $routeParams, Opportunity) {
    var self = this;
    console.log(JSON.stringify($routeParams));

    AngularForce.login(function () {
        Opportunity.get({id: $routeParams.oppId}, function (opp) {
            self.original = opp;
            $scope.opp = new Opportunity(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    });

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.opp);
    };

    $scope.destroy = function () {
        self.original.destroy(function () {
            $scope.$apply(function () {
                $location.path('/list');
            });
        });
    };

    $scope.save = function () {
        $scope.opp.update(function () {
            $scope.$apply(function () {
                $location.path('/');
            });

        });
    };
}
