(function(){

/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridColumnMenu
 * @element style
 * @restrict A
 *
 * @description
 * Allows us to interpolate expressions in `<style>` elements. Angular doesn't do this by default as it can/will/might? break in IE8.
 *
 * @example
 <doc:example module="app">
 <doc:source>
 <script>
 var app = angular.module('app', ['ui.grid']);

 app.controller('MainCtrl', ['$scope', function ($scope) {
   
 }]);
 </script>

 <div ng-controller="MainCtrl">
   <div ui-grid-menu shown="true"  ></div>
 </div>
 </doc:source>
 <doc:scenario>
 </doc:scenario>
 </doc:example>
 */
angular.module('ui.grid')

.directive('uiGridMenu', ['$log', '$compile', '$timeout', '$window', '$document', 'gridUtil', function ($log, $compile, $timeout, $window, $document, gridUtil) {
  var uiGridMenu = {
    priority: 0,
    scope: {
      // shown: '&',
      menuItems: '=',
      autoHide: '=?'
    },
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridMenu',
    replace: false,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      var self = this;
      gridUtil.enableAnimations($elm);

      
    // *** Show/Hide functions ******
      self.showMenu = $scope.showMenu = function() {
        $scope.shown = true;

        // Turn off an existing dpcument click handler
        angular.element(document).off('click', applyHideMenu);

        // Turn on the document click handler, but in a timeout so it doesn't apply to THIS click if there is one
        $timeout(function() {
          angular.element(document).on('click', applyHideMenu);
        });
      };

      self.hideMenu = $scope.hideMenu = function() {
        $scope.shown = false;
        $scope.$emit('menu-hidden');
        angular.element(document).off('click', applyHideMenu);
      };

      $scope.$on('hide-menu', function () {
        $scope.hideMenu();
      });

      $scope.$on('show-menu', function () {
        $scope.showMenu();
      });

      
    // *** Auto hide when click elsewhere ******
      var applyHideMenu = function(){
        $scope.$apply(function () {
          $scope.hideMenu();
        });
      };
    
      if (typeof($scope.autoHide) === 'undefined' || $scope.autoHide === undefined) {
        $scope.autoHide = true;
      }

      if ($scope.autoHide) {
        angular.element($window).on('resize', applyHideMenu);
      }

      $scope.$on('$destroy', function () {
        angular.element(document).off('click', applyHideMenu);
      });
      

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', applyHideMenu);
      });
    },
    
    
    controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
      var self = this;
    }]
  };

  return uiGridMenu;
}])

.directive('uiGridMenuItem', ['$log', 'gridUtil', '$compile', 'i18nService', function ($log, gridUtil, $compile, i18nService) {
  var uiGridMenuItem = {
    priority: 0,
    scope: {
      title: '=',
      active: '=',
      action: '=',
      icon: '=',
      shown: '=',
      context: '=',
      templateUrl: '='
    },
    require: ['?^uiGrid', '^uiGridMenu'],
    templateUrl: 'ui-grid/uiGridMenuItem',
    replace: true,
    compile: function($elm, $attrs) {
      return {
        pre: function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0],
              uiGridMenuCtrl = controllers[1];
          
          if ($scope.templateUrl) {
            gridUtil.getTemplate($scope.templateUrl)
                .then(function (contents) {
                  var template = angular.element(contents);
                    
                  var newElm = $compile(template)($scope);
                  $elm.replaceWith(newElm);
                });
          }
        },
        post: function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0],
              uiGridMenuCtrl = controllers[1];

          // TODO(c0bra): validate that shown and active are functions if they're defined. An exception is already thrown above this though
          // if (typeof($scope.shown) !== 'undefined' && $scope.shown && typeof($scope.shown) !== 'function') {
          //   throw new TypeError("$scope.shown is defined but not a function");
          // }
          if (typeof($scope.shown) === 'undefined' || $scope.shown === null) {
            $scope.shown = function() { return true; };
          }

          $scope.itemShown = function () {
            var context = {};
            if ($scope.context) {
              context.context = $scope.context;
            }

            if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
              context.grid = uiGridCtrl.grid;
            }

            return $scope.shown.call(context);
          };

          $scope.itemAction = function($event,title) {
            $log.debug('itemAction');
            $event.stopPropagation();

            if (typeof($scope.action) === 'function') {
              var context = {};

              if ($scope.context) {
                context.context = $scope.context;
              }

              // Add the grid to the function call context if the uiGrid controller is present
              if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
                context.grid = uiGridCtrl.grid;
              }

              $scope.action.call(context, $event, title);

              $scope.$emit('hide-menu');
            }
          };

          $scope.i18n = i18nService.get();
        }
      };
    }
  };

  return uiGridMenuItem;
}]);

})();