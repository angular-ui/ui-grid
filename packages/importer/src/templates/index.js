angular.module('ui.grid.importer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/importerMenuItem', require('./importerMenuItem.html'));
  $templateCache.put('ui-grid/importerMenuItemContainer', require('./importerMenuItemContainer.html'));
}]);
