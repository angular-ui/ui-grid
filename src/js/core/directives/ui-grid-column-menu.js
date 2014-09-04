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
      uiGridCtrl.columnMenuCtrl = self;

      // Save whether we're shown or not so the columns can check
      self.shown = $scope.menuShown = false;

      // Put asc and desc sort directions in scope
      $scope.asc = uiGridConstants.ASC;
      $scope.desc = uiGridConstants.DESC;

      // $scope.i18n = i18nService;

      // Get the grid menu element. We'll use it to calculate positioning
      var menu = $elm[0].querySelectorAll('.ui-grid-menu');

      // Get the inner menu part. It's what slides up/down
      var inner = $elm[0].querySelectorAll('.ui-grid-menu-inner');

      /**
       * @ngdoc boolean
       * @name enableSorting
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds sort
       * widgets to the column header, allowing sorting of the data in the individual column.
       */
      function sortable() {
        if (uiGridCtrl.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
          return true;
        }
        else {
          return false;
        }
      }

      /**
       * @ngdoc boolean
       * @name enableFiltering
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds filter
       * widgets to the column header, allowing filtering of the data in the individual column.
       */
      function filterable() {
        if (uiGridCtrl.grid.options.enableFiltering && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableFiltering) {
          return true;
        }
        else {
          return false;
        }
      }
      
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
            return sortable();
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
            return sortable();
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
            return (sortable() && typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null);
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
      self.showMenu = function(column, $columnElement) {
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
        if (uiGridCtrl.grid.options.offsetLeft) {
          offset = uiGridCtrl.grid.options.offsetLeft;
        }

        var height = gridUtil.elementHeight($columnElement, true);
        var width = gridUtil.elementWidth($columnElement, true);

        // Flag for whether we're hidden for showing via $animate
        var hidden = false;

        // Re-position the menu AFTER it's been shown, so we can calculate the width correctly.
        function reposition() {
          $timeout(function() {
            if (hidden && $animate) {
              $animate.removeClass(inner, 'ng-hide');
              self.shown = $scope.menuShown = true;
              $scope.$broadcast('show-menu');
            }
            else if (angular.element(inner).hasClass('ng-hide')) {
              angular.element(inner).removeClass('ng-hide');
            }

            // var containerScrollLeft = $columnelement
            var containerId = column.renderContainer ? column.renderContainer : 'body';
            var renderContainer = $scope.grid.renderContainers[containerId];
            var containerScrolLeft = renderContainer.prevScrollLeft;

            var myWidth = gridUtil.elementWidth(menu, true);

            // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
            // Get the column menu right padding
            var paddingRight = parseInt(angular.element(menu).css('padding-right'), 10);

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
          $animate.addClass(inner, 'ng-hide', reposition);
          hidden = true;
        }
        else {
          self.shown = $scope.menuShown = true;
          $scope.$broadcast('show-menu');
          reposition();
        }
      };

      // Hide the menu
      self.hideMenu = function() {
        self.col = null;
        self.shown = $scope.menuShown = false;
        $scope.$broadcast('hide-menu');
      };

      // Prevent clicks on the menu from bubbling up to the document and making it hide prematurely
      // $elm.on('click', function (event) {
      //   event.stopPropagation();
      // });

      function documentClick() {
        $scope.$apply(self.hideMenu);
        $document.off('click', documentClick);
      }
      
      function resizeHandler() {
        $scope.$apply(self.hideMenu);
      }
      angular.element($window).bind('resize', resizeHandler);

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
        self.hideMenu();
        // if (!$scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, function(evt, args) {
        self.hideMenu();
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
            uiGridCtrl.refresh();
            self.hideMenu();
          });
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        uiGridCtrl.refresh();
        self.hideMenu();
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