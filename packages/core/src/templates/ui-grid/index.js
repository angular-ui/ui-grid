angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/ui-grid-filter', require('./ui-grid-filter.html'));
  $templateCache.put('ui-grid/ui-grid-footer', require('./ui-grid-footer.html'));
  $templateCache.put('ui-grid/ui-grid-grid-footer', require('./ui-grid-grid-footer.html'));
  $templateCache.put('ui-grid/ui-grid-header', require('./ui-grid-header.html'));
  $templateCache.put('ui-grid/ui-grid-menu-button', require('./ui-grid-menu-button.html'));
  $templateCache.put('ui-grid/ui-grid-menu-header-item', require('./ui-grid-menu-header-item.html'));
  $templateCache.put('ui-grid/ui-grid-no-header', require('./ui-grid-no-header.html'));
  $templateCache.put('ui-grid/ui-grid-row', require('./ui-grid-row.html'));
  $templateCache.put('ui-grid/ui-grid', require('./ui-grid.html'));
  $templateCache.put('ui-grid/uiGridCell', require('./uiGridCell.html'));
  $templateCache.put('ui-grid/uiGridColumnMenu', require('./uiGridColumnMenu.html'));
  $templateCache.put('ui-grid/uiGridFooterCell', require('./uiGridFooterCell.html'));
  $templateCache.put('ui-grid/uiGridHeaderCell', require('./uiGridHeaderCell.html'));
  $templateCache.put('ui-grid/uiGridMenu', require('./uiGridMenu.html'));
  $templateCache.put('ui-grid/uiGridMenuItem', require('./uiGridMenuItem.html'));
  $templateCache.put('ui-grid/uiGridRenderContainer', require('./uiGridRenderContainer.html'));
  $templateCache.put('ui-grid/uiGridViewport', require('./uiGridViewport.html'));
}]);
