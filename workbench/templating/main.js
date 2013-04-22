/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />
var app = angular.module('myApp', ['ngResource', 'ngGrid']); // 'ngMockE2E'

app.controller('MyCtrl', ['$scope', '$http', '$httpBackend', 'MyData', function ($scope, $http, $httpBackend, MyData) {
  // $http.get('data.json')
  // $http.get('/data_response')
      // .success(function(data){
      //     $scope.myData = data;
      // });
  
  $scope.selections = [];

  $scope.myData = MyData.query();

  $scope.gridOptions = {
      data: 'myData',
      rowTemplate: 'external_row_template.html',
      // selections: $scope.selections,
      // primaryKey: 'id',
      // enableRowSelection: true,
      // multiSelect: false,
      // keepLastSelected: false,
      // columnDefs: [
      //   { field: 'name', displayName: 'Name' },
      //   { field: 'age', displayName: 'Age' },
      // ],
      // filterOptions: { filterText: '' }
  };
}]);

app.factory('MyData', ['$resource', '$http', function($resource, $http) {
  return $resource('data.json');
}]);

// app.run(['$httpBackend', function($httpBackend) {
//   $httpBackend.whenGET('data.json').respond(function() {
//     sleep(2500);
//     return [200,
//       [{ "name": "Moroni",  "age": 50, "id": 101 },
//        { "name": "Tiancum", "age": 43, "id": 102 },
//        { "name": "Jacob",   "age": 27, "id": 103 },
//        { "name": "Nephi",   "age": 29, "id": 104 },
//        { "name": "Enos",    "age": 34, "id": 105 }]
//     ];
//   });
// }]);

// function sleep(ms) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 10000000; i++) {
//     if ((new Date().getTime() - start) > ms){
//       break;
//     }
//   }
// };