(function() {

/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridMenu
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

.directive('uiGridMenu', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 'i18nService',
function ($compile, $timeout, $window, $document, gridUtil, uiGridConstants, i18nService) {
  return {
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
      $scope.dynamicStyles = '';
      if (uiGridCtrl && uiGridCtrl.grid && uiGridCtrl.grid.options && uiGridCtrl.grid.options.gridMenuTemplate) {
        var gridMenuTemplate = uiGridCtrl.grid.options.gridMenuTemplate;
        gridUtil.getTemplate(gridMenuTemplate).then(function (contents) {
          var template = angular.element(contents);
          var newElm = $compile(template)($scope);
          $elm.replaceWith(newElm);
        }).catch(angular.noop);
      }

      var setupHeightStyle = function(gridHeight) {
        // menu appears under header row, so substract that height from it's total
        // additional 20px for general padding
        var gridMenuMaxHeight = gridHeight - uiGridCtrl.grid.headerHeight - 20;
        $scope.dynamicStyles = [
          '.grid' + uiGridCtrl.grid.id + ' .ui-grid-menu-mid {',
          'max-height: ' + gridMenuMaxHeight + 'px;',
          '}'
        ].join(' ');
      };

      if (uiGridCtrl) {
        setupHeightStyle(uiGridCtrl.grid.gridHeight);
        uiGridCtrl.grid.api.core.on.gridDimensionChanged($scope, function(oldGridHeight, oldGridWidth, newGridHeight, newGridWidth) {
          setupHeightStyle(newGridHeight);
        });
      }

      $scope.i18n = {
        close: i18nService.getSafeText('columnMenu.close')
      };

    // *** Show/Hide functions ******
      $scope.showMenu = function(event, args) {
        if ( !$scope.shown ) {

          /*
           * In order to animate cleanly we remove the ng-if, wait a digest cycle, then
           * animate the removal of the ng-hide.  We can't successfully (so far as I can tell)
           * animate removal of the ng-if, as the menu items aren't there yet.  And we don't want
           * to rely on ng-show only, as that leaves elements in the DOM that are needlessly evaluated
           * on scroll events.
           *
           * Note when testing animation that animations don't run on the tutorials.  When debugging it looks
           * like they do, but angular has a default $animate provider that is just a stub, and that's what's
           * being called.  ALso don't be fooled by the fact that your browser has actually loaded the
           * angular-translate.js, it's not using it.  You need to test animations in an external application.
           */
          $scope.shown = true;

          // Must be a timeout in order to work properly in Firefox. Issue #6533
          $timeout(function() {
            $scope.shownMid = true;
            $scope.$emit('menu-shown');
          });
        } else if ( !$scope.shownMid ) {
          // we're probably doing a hide then show, so we don't need to wait for ng-if
          $scope.shownMid = true;
          $scope.$emit('menu-shown');
        }

        var docEventType = 'click';
        if (args && args.originalEvent && args.originalEvent.type && args.originalEvent.type === 'touchstart') {
          docEventType = args.originalEvent.type;
        }

        // Turn off an existing document click handler
        angular.element(document).off('click touchstart', applyHideMenu);
        $elm.off('keyup', checkKeyUp);
        $elm.off('keydown', checkKeyDown);

        // Turn on the document click handler, but in a timeout so it doesn't apply to THIS click if there is one
        $timeout(function() {
          angular.element(document).on(docEventType, applyHideMenu);
          $elm.on('keyup', checkKeyUp);
          $elm.on('keydown', checkKeyDown);
        });
      };


      $scope.hideMenu = function(event) {
        if ( $scope.shown ) {
          /*
           * In order to animate cleanly we animate the addition of ng-hide, then use a $timeout to
           * set the ng-if (shown = false) after the animation runs.  In theory we can cascade off the
           * callback on the addClass method, but it is very unreliable with unit tests for no discernable reason.
           *
           * The user may have clicked on the menu again whilst
           * we're waiting, so we check that the mid isn't shown before applying the ng-if.
           */
          $scope.shownMid = false;
          $timeout( function() {
            if ( !$scope.shownMid ) {
              $scope.shown = false;
              $scope.$emit('menu-hidden');
            }
          }, 40);
        }

        angular.element(document).off('click touchstart', applyHideMenu);
        $elm.off('keyup', checkKeyUp);
        $elm.off('keydown', checkKeyDown);
      };

      $scope.$on('hide-menu', function (event, args) {
        $scope.hideMenu(event, args);
      });

      $scope.$on('show-menu', function (event, args) {
        $scope.showMenu(event, args);
      });


    // *** Auto hide when click elsewhere ******
      var applyHideMenu = function() {
        if ($scope.shown) {
          $scope.$apply(function () {
            $scope.hideMenu();
          });
        }
      };

      // close menu on ESC and keep tab cyclical
      var checkKeyUp = function(event) {
        if (event.keyCode === 27) {
          $scope.hideMenu();
        }
      };

      var checkKeyDown = function(event) {
        var setFocus = function(elm) {
          elm.focus();
          event.preventDefault();
          return false;
        };
        if (event.keyCode === 9) {
          var firstMenuItem, lastMenuItem;
          var menuItemButtons = $elm[0].querySelectorAll('button:not(.ng-hide)');
          if (menuItemButtons.length > 0) {
            firstMenuItem = menuItemButtons[0];
            lastMenuItem = menuItemButtons[menuItemButtons.length - 1];
            if (event.target === lastMenuItem && !event.shiftKey) {
              setFocus(firstMenuItem);
            } else if (event.target === firstMenuItem && event.shiftKey) {
              setFocus(lastMenuItem);
            }
          }
        }
      };

      if (typeof($scope.autoHide) === 'undefined' || $scope.autoHide === undefined) {
        $scope.autoHide = true;
      }

      if ($scope.autoHide) {
        angular.element($window).on('resize', applyHideMenu);
      }

      $scope.$on('$destroy', function unbindEvents() {
        angular.element($window).off('resize', applyHideMenu);
        angular.element(document).off('click touchstart', applyHideMenu);
        $elm.off('keyup', checkKeyUp);
        $elm.off('keydown', checkKeyDown);
      });

      if (uiGridCtrl) {
       $scope.$on('$destroy', uiGridCtrl.grid.api.core.on.scrollBegin($scope, applyHideMenu ));
      }

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, applyHideMenu ));
    }
  };
}])

.directive('uiGridMenuItem', ['gridUtil', '$compile', 'i18nService', function (gridUtil, $compile, i18nService) {
  return {
    priority: 0,
    scope: {
      name: '=',
      active: '=',
      action: '=',
      icon: '=',
      shown: '=',
      context: '=',
      templateUrl: '=',
      leaveOpen: '=',
      screenReaderOnly: '='
    },
    require: ['?^uiGrid'],
    templateUrl: 'ui-grid/uiGridMenuItem',
    replace: false,
    compile: function() {
      return {
        pre: function ($scope, $elm) {
          if ($scope.templateUrl) {
            gridUtil.getTemplate($scope.templateUrl)
                .then(function (contents) {
                  var template = angular.element(contents);

                  var newElm = $compile(template)($scope);
                  $elm.replaceWith(newElm);
                }).catch(angular.noop);
          }
        },
        post: function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0];

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

          $scope.itemAction = function($event, title) {
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

              if ( !$scope.leaveOpen ) {
                $scope.$emit('hide-menu');
              } else {
                // Maintain focus on the selected item
                var correctParent = $event.target.parentElement;

                // nodeName of 'I' means target is i element, need the next parent
                if (angular.element($event.target)[0].nodeName === 'I') {
                  correctParent = correctParent.parentElement;
                }

                gridUtil.focus.bySelector(correctParent, 'button[type=button]', true);
              }
            }
          };

          $scope.label = function() {
            var toBeDisplayed = $scope.name;

            if (typeof($scope.name) === 'function') {
              toBeDisplayed = $scope.name.call();
            }

            return toBeDisplayed;
          };

          $scope.i18n = i18nService.get();
        }
      };
    }
  };
}]);

})();
