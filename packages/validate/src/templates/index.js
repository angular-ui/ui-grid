angular.module('ui.grid.validate').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/cellTitleValidator', require('./cellTitleValidator.html'));
  $templateCache.put('ui-grid/cellTooltipValidator', require('./cellTooltipValidator.html'));
}]);
