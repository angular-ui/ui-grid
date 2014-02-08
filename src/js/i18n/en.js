/**
 * Created by Tim on 2/1/14.
 */
(function () {
  angular.module('ui.i18n').service('ui-i18n-en', ['ui-i18nService',
    function (i18nService) {
      i18nService.add('en', {
        aggregate: {
          label: 'items'
        },
        groupPanel: {
          description: 'Drag a column header here and drop it to group by that column.'
        },
        search: {
          placeholder: 'Search...',
          showingItems: 'Showing Items:',
          selectedItems: 'Selected Items:',
          totalItems: 'Total Items:',
          size: 'Page Size:',
          first: 'First Page',
          next: 'Next Page',
          previous: 'Previous Page',
          last: 'Last Page'
        },
        menu: {
          text: 'Choose Columns:'
        }
      });
    }]);
})();