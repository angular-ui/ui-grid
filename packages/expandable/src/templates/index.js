angular.module('ui.grid.expandable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/expandableRow', require('./expandableRow.html'));
  $templateCache.put('ui-grid/expandableRowHeader', require('./expandableRowHeader.html'));
  $templateCache.put('ui-grid/expandableScrollFiller', require('./expandableScrollFiller.html'));
  $templateCache.put('ui-grid/expandableTopRowHeader', require('./expandableTopRowHeader.html'));
}]);
