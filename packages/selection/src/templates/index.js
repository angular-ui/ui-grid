angular.module('ui.grid.selection').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/gridFooterSelectedItems', require('./gridFooterSelectedItems.html'));
  $templateCache.put('ui-grid/selectionHeaderCell', require('./selectionHeaderCell.html'));
  $templateCache.put('ui-grid/selectionRowHeader', require('./selectionRowHeader.html'));
  $templateCache.put('ui-grid/selectionRowHeaderButtons', require('./selectionRowHeaderButtons.html'));
  $templateCache.put('ui-grid/selectionSelectAllButtons', require('./selectionSelectAllButtons.html'));
}]);
