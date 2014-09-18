(function(){

angular.module('ui.grid').directive('uiGridColumnMenu', ['$log', '$timeout', '$window', '$document', '$injector', 'gridUtil', 'uiGridConstants', 'i18nService', function ($log, $timeout, $window, $document, $injector, gridUtil, uiGridConstants, i18nService) {

  var uiGridColumnMenu = {
    priority: 0,
    scope: true,
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridColumnMenu',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      gridUtil.enableAnimations($elm);

      $scope.grid = uiGridCtrl.grid;

      var self = this;

      // Store a reference to this link/controller in the main uiGrid controller
      // to allow showMenu later
      uiGridCtrl.columnMenuScope = $scope;

      // Save whether we're shown or not so the columns can check
      self.shown = $scope.menuShown = false;

      // Put asc and desc sort directions in scope
      $scope.asc = uiGridConstants.ASC;
      $scope.desc = uiGridConstants.DESC;

      // $scope.i18n = i18nService;

      // Get the grid menu element. We'll use it to calculate positioning
      $scope.menu = $elm[0].querySelectorAll('.ui-grid-menu');

      // Get the inner menu part. It's what slides up/down
      $scope.inner = $elm[0].querySelectorAll('.ui-grid-menu-inner');

      /**
       * @ngdoc boolean
       * @name enableSorting
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds sort
       * widgets to the column header, allowing sorting of the data in the individual column.
       */
      $scope.sortable = function() {
        if (uiGridCtrl.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
          return true;
        }
        else {
          return false;
        }
      };

      /**
       * @ngdoc boolean
       * @name enableFiltering
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds filter
       * widgets to the column header, allowing filtering of the data in the individual column.
       */
      $scope.filterable = function() {
        if (uiGridCtrl.grid.options.enableFiltering && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableFiltering) {
          return true;
        }
        else {
          return false;
        }
      };
      
      var defaultMenuItems = [
        // NOTE: disabling this in favor of a little filter text box
        // Column filter input
        // {
        //   templateUrl: 'ui-grid/uiGridColumnFilter',
        //   action: function($event) {
        //     $event.stopPropagation();
        //     $scope.filterColumn($event);
        //   },
        //   cancel: function ($event) {
        //     $event.stopPropagation();

        //     $scope.col.filter = {};
        //   },
        //   shown: function () {
        //     return filterable();
        //   }
        // },
        {
          title: i18nService.getSafeText('sort.ascending'),
          icon: 'ui-grid-icon-sort-alt-up',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.ASC);
          },
          shown: function () {
            return $scope.sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.ASC);
          }
        },
        {
          title: i18nService.getSafeText('sort.descending'),
          icon: 'ui-grid-icon-sort-alt-down',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.DESC);
          },
          shown: function() {
            return $scope.sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.DESC);
          }
        },
        {
          title: i18nService.getSafeText('sort.remove'),
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.unsortColumn();
          },
          shown: function() {
            return ($scope.sortable() && typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null);
          }
        },
        {
          title: i18nService.getSafeText('column.hide'),
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.hideColumn();
          }
        }
      ];

      // Set the menu items for use with the column menu. Let's the user specify extra menu items per column if they want.
      $scope.menuItems = defaultMenuItems;
      $scope.$watch('col.menuItems', function (n, o) {
        if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
          n.forEach(function (item) {
            if (typeof(item.context) === 'undefined' || !item.context) {
              item.context = {};
            }
            item.context.col = $scope.col;
          });

          $scope.menuItems = defaultMenuItems.concat(n);
        }
        else {
          $scope.menuItems = defaultMenuItems;
        }
      });

      var $animate;
      try {
        $animate = $injector.get('$animate');
      }
      catch (e) {
        $log.info('$animate service not found (ngAnimate not add as a dependency?), menu animations will not occur');
      }

      // Show the menu
      $scope.showMenu = function(column, $columnElement) {
        // Swap to this column
        //   note - store a reference to this column in 'self' so the columns can check whether they're the shown column or not
        self.col = $scope.col = column;

        // Remove an existing document click handler
        $document.off('click', documentClick);

        /* Reposition the menu below this column's element */
        var left = $columnElement[0].offsetLeft;
        var top = $columnElement[0].offsetTop;

        // Get the grid scrollLeft
        var offset = 0;
        if (column.grid.options.offsetLeft) {
          offset = column.grid.options.offsetLeft;
        }

        var height = gridUtil.elementHeight($columnElement, true);
        var width = gridUtil.elementWidth($columnElement, true);

        // Flag for whether we're hidden for showing via $animate
        var hidden = false;

        // Re-position the menu AFTER it's been shown, so we can calculate the width correctly.
        function reposition() {
          $timeout(function() {
            if (hidden && $animate) {
              $animate.removeClass($scope.inner, 'ng-hide');
              self.shown = $scope.menuShown = true;
              $scope.$broadcast('show-menu');
            }
            else if (angular.element($scope.inner).hasClass('ng-hide')) {
              angular.element($scope.inner).removeClass('ng-hide');
            }

            // var containerScrollLeft = $columnelement
            var containerId = column.renderContainer ? column.renderContainer : 'body';
            var renderContainer = column.grid.renderContainers[containerId];
            var containerScrolLeft = renderContainer.prevScrollLeft;

            var myWidth = gridUtil.elementWidth($scope.menu, true);

            // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
            // Get the column menu right padding
            var paddingRight = parseInt(angular.element($scope.menu).css('padding-right'), 10);

            $log.debug('position', left + ' + ' + width + ' - ' + myWidth + ' + ' + paddingRight);

            // $elm.css('left', (left - offset + width - myWidth + paddingRight) + 'px');
            // $elm.css('left', (left + width - myWidth + paddingRight) + 'px');
            $elm.css('left', (left - containerScrolLeft + width - myWidth + paddingRight) + 'px');
            $elm.css('top', (top + height) + 'px');

            // Hide the menu on a click on the document
            $document.on('click', documentClick);
          });
        }

        if ($scope.menuShown && $animate) {
          // Animate closing the menu on the current column, then animate it opening on the other column
          $animate.addClass($scope.inner, 'ng-hide', reposition);
          hidden = true;
        }
        else {
          self.shown = $scope.menuShown = true;
          $scope.$broadcast('show-menu');
          reposition();
        }
      };

      // Hide the menu
      $scope.hideMenu = function() {
        delete self.col;
        delete $scope.col;
        self.shown = $scope.menuShown = false;
        $scope.$broadcast('hide-menu');
      };

      // Prevent clicks on the menu from bubbling up to the document and making it hide prematurely
      // $elm.on('click', function (event) {
      //   event.stopPropagation();
      // });

      function documentClick() {
        $scope.$apply($scope.hideMenu);
        $document.off('click', documentClick);
      }
      
      function resizeHandler() {
        $scope.$apply($scope.hideMenu);
      }
      angular.element($window).bind('resize', resizeHandler);

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
        $scope.hideMenu();
        // if (!$scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, function(evt, args) {
        $scope.hideMenu();
        // if (!$scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', resizeHandler);
        $document.off('click', documentClick);
      });

      /* Column methods */
      $scope.sortColumn = function (event, dir) {
        event.stopPropagation();

        uiGridCtrl.grid.sortColumn($scope.col, dir, true)
          .then(function () {
            uiGridCtrl.grid.refresh();
            $scope.hideMenu();
          });
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        uiGridCtrl.grid.refresh();
        $scope.hideMenu();
      };

      $scope.hideColumn = function () {
        $scope.col.colDef.visible = false;

        uiGridCtrl.grid.refresh();
        $scope.hideMenu();
      };
    },
    controller: ['$scope', function ($scope) {
      var self = this;
      
      $scope.$watch('menuItems', function (n, o) {
        self.menuItems = n;
      });
    }]
  };

  return uiGridColumnMenu;

}]);

})();