angular.module('ui.grid.pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/pagination', require('./pagination.html'));
}]);
