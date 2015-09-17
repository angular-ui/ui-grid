/**
* Created by L007 on 2/1/14.
*/
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('sk', {
        aggregate: {
          label: 'items'
        },
        groupPanel: {
          description: 'Pretiahni sem názov stĺpca pre zoskupenie podľa toho stĺpca.'
        },
        search: {
          placeholder: 'Hľadaj...',
          showingItems: 'Zobrazujem položky:',
          selectedItems: 'Vybraté položky:',
          totalItems: 'Počet položiek:',
          size: 'Počet:',
          first: 'Prvá strana',
          next: 'Ďalšia strana',
          previous: 'Predchádzajúca strana',
          last: 'Posledná strana'
        },
        menu: {
          text: 'Vyberte stĺpce:'
        },
        sort: {
          ascending: 'Zotriediť vzostupne',
          descending: 'Zotriediť zostupne',
          remove: 'Vymazať triedenie'
        },
        aggregation: {
          count: 'total rows: ',
          sum: 'total: ',
          avg: 'avg: ',
          min: 'min: ',
          max: 'max: '
        },
        gridMenu: {
          columns: 'Columns:',
          importerTitle: 'Import file',
          exporterAllAsCsv: 'Export all data as csv',
          exporterVisibleAsCsv: 'Export visible data as csv',
          exporterSelectedAsCsv: 'Export selected data as csv',
          exporterAllAsPdf: 'Export all data as pdf',
          exporterVisibleAsPdf: 'Export visible data as pdf',
          exporterSelectedAsPdf: 'Export selected data as pdf',
          clearAllFilters: 'Clear all filters'
        },
        importer: {
          noHeaders: 'Column names were unable to be derived, does the file have a header?',
          noObjects: 'Objects were not able to be derived, was there data in the file other than headers?',
          invalidCsv: 'File was unable to be processed, is it valid CSV?',
          invalidJson: 'File was unable to be processed, is it valid Json?',
          jsonNotArray: 'Imported json file must contain an array, aborting.'
        }
      });
      return $delegate;
    }]);
  }]);
})();
