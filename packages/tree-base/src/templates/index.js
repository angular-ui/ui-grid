angular.module('ui.grid.treeBase').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/treeBaseExpandAllButtons', require('./treeBaseExpandAllButtons.html'));
  $templateCache.put('ui-grid/treeBaseHeaderCell', require('./treeBaseHeaderCell.html'));
  $templateCache.put('ui-grid/treeBaseRowHeader', require('./treeBaseRowHeader.html'));
  $templateCache.put('ui-grid/treeBaseRowHeaderButtons', require('./treeBaseRowHeaderButtons.html'));
}]);
