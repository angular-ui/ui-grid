(function () {
  'use strict';
  var module = angular.module('ui.grid.cellnav', ['ui.grid', 'ui.grid.util']);

  /**
   *  @ngdoc object
   *  @name ui.grid.cellnav.constant:uiGridEditConstants
   *
   *  @description constants available in edit module
   */
  module.constant('uiGridCellNavConstants', {
 //   EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    //must be lowercase because template bulder converts to lower

  });

  /**
   *  @ngdoc service
   *  @name ui.grid.cellnav.service:uiGridNavService
   *
   *  @description Services for editing features
   */
  module.service('uiGridCellNavService', ['$log', '$q', '$templateCache',
    function ($log, $q, $templateCache) {

      var service = {
      };

      return service;
    }]);

  /**
  *  @ngdoc directive
  *  @name ui.grid.cellnav.directive:uiCellNav
  *  @element div
  *  @restrict EA
  *
  *  @description Adds editing features to the ui-grid directive.
  *
  *  @example
  <example module="app">
    <file name="app.js">
    var app = angular.module('app', ['ui.grid', 'ui.grid.cellnav']);

    app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {field: 'name',
        {field: 'title'}
      ];
    }]);
    </file>
    <file name="index.html">
    <div ng-controller="MainCtrl">
      <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-edit></div>
    </div>
    </file>
  </example>
  */
  module.directive('uiGridCellnav', ['$log', 'uiGridCellNavService', function ($log, uiGridCellNavService) {
    return {
      replace: true,
      priority: 5000,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('uiGridEdit preLink');

          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellnav.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide cell navigation
   */
  module.directive('uiGridCell', ['$compile', 'uiGridConstants', '$log',
    function ($compile, uiGridConstants,  $log) {
      var ngCell = {
        priority: -110, // run after default uiGridCell directive
        restrict: 'A',
        scope: false,
        compile: function () {
          return {
//            pre: function ($scope, $elm, $attrs) {
//              $log.debug('cellnav uiGridCell pre-link');
//
//            },
            post: function ($scope, $elm, $attrs) {
              $log.debug('cellnav uiGridCell post-link');

              $elm.find('div').attr("tabindex",0);
            }
          };
        }
      };

      return ngCell;
    }]);

})();