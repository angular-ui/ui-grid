angular.module('ui.grid.resizeColumns').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/columnResizer', require('./columnResizer.html'));
}]);
