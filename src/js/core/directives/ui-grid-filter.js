(function() {
  'use strict';

  angular.module('ui.grid').directive('uiGridFilter', ['$compile', '$templateCache', 'i18nService', 'gridUtil', function ($compile, $templateCache, i18nService, gridUtil) {

    return {
      compile: function() {
        return {
          pre: function ($scope, $elm) {
            $scope.col.updateFilters = function( filterable ) {
              $elm.children().remove();
              if ( filterable ) {
                var template = $scope.col.filterHeaderTemplate;
                if (template === undefined && $scope.col.providedFilterHeaderTemplate !== '') {
                  if ($scope.col.filterHeaderTemplatePromise) {
                    $scope.col.filterHeaderTemplatePromise.then(function () {
                      template = $scope.col.filterHeaderTemplate;
                      $elm.append($compile(template)($scope));
                    });
                  }
                }
                else {
                  $elm.append($compile(template)($scope));
                }
              }
            };

            $scope.$on( '$destroy', function() {
              delete $scope.col.updateFilters;
            });
          },
          post: function ($scope, $elm) {
            $scope.aria = i18nService.getSafeText('headerCell.aria');
            $scope.removeFilter = function(colFilter, index) {
              colFilter.term = null;
              // Set the focus to the filter input after the action disables the button
              gridUtil.focus.bySelector($elm, '.ui-grid-filter-input-' + index);
            };
          }
        };
      }
    };
  }]);
})();
