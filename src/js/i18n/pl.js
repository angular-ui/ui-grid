/**
 * Created by zuk38 & przemoli on 9/11/15.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('pl', {
        headerCell: {
          aria: {
            defaultFilterLabel: 'Filter dla kolumny',
            removeFilter: 'Usuń filter',
            columnMenuButtonLabel: 'Menu kolumny'
          },
          priority: 'Prioritet:',
          filterLabel: "Filtr dla kolumny: "
        },
        aggregate: {
          label: 'pozycji'
        },
        groupPanel: {
          description: 'Przeciągnij nagłówek kolumny tutaj, aby pogrupować według niej.'
        },
        search: {
          placeholder: 'Szukaj...',
          showingItems: 'Widoczne pozycje:',
          selectedItems: 'Zaznaczone pozycje:',
          totalItems: 'Wszystkich pozycji:',
          size: 'Rozmiar strony:',
          first: 'Pierwsza strona',
          next: 'Następna strona',
          previous: 'Poprzednia strona',
          last: 'Ostatnia strona'
        },
        menu: {
          text: 'Wybierz kolumny:'
        },
        sort: {
          ascending: 'Sortuj rosnąco',
          descending: 'Sortuj malejąco',
          none: 'Brak sortowania',
          remove: 'Wyłącz sortowanie'
        },
        column: {
          hide: 'Ukryj kolumne'
        },
        aggregation: {
          count: 'Razem pozycji: ',
            sum: 'Razem: ',
            avg: 'Średnia: ',
            min: 'Min: ',
            max: 'Max: '
        },
        pinning: {
          pinLeft: 'Przypnij do lewej',
          pinRight: 'Przypnij do prawej',
          unpin: 'Odepnij'
        },
        columnMenu: {
          close: 'Zamknij'
        },
        gridMenu: {
          aria: {
            buttonLabel: 'Menu Grida'
          },
          columns: 'Kolumny:',
          importerTitle: 'Importuj plik',
          exporterAllAsCsv: 'Eksportuj wszystkie dane do csv',
          exporterVisibleAsCsv: 'Eksportuj widoczne dane do csv',
          exporterSelectedAsCsv: 'Eksportuj zaznaczone dane do csv',
          exporterAllAsPdf: 'Eksportuj wszystkie dane do pdf',
          exporterVisibleAsPdf: 'Eksportuj widoczne dane do pdf',
          exporterSelectedAsPdf: 'Eksportuj zaznaczone dane do pdf',
          clearAllFilters: 'Wyczyść filtry'
        },
        importer: {
          noHeaders: 'Nie udało się wczytać nazw kolumn. Czy plik posiada nagłówek?',
          noObjects: 'Nie udalo się wczytać pozycji. Czy plik zawiera dane??',
          invalidCsv: 'Nie udało się przetworzyć pliku, jest to prawidlowy plik CSV??',
          invalidJson: 'Nie udało się przetworzyć pliku, jest to prawidlowy plik Json?',
          jsonNotArray: 'Importowany plik json musi zawierać tablicę, importowanie przerwane.'
        },
        pagination: {
          aria: {
            pageToFirst: 'Pierwsza strona',
            pageBack: 'Poprzednia strona',
            pageSelected: 'Wybrana strona',
            pageForward: 'Następna strona',
            pageToLast: 'Ostatnia strona'
          },
          sizes: 'pozycji na stronę',
          totalItems: 'pozycji',
          through: 'do',
          of: 'z'
        },
        grouping: {
          group: 'Grupuj',
          ungroup: 'Rozgrupuj',
          aggregate_count: 'Zbiorczo: Razem',
          aggregate_sum: 'Zbiorczo: Suma',
          aggregate_max: 'Zbiorczo: Max',
          aggregate_min: 'Zbiorczo: Min',
          aggregate_avg: 'Zbiorczo: Średnia',
          aggregate_remove: 'Zbiorczo: Usuń'
        }
      });
      return $delegate;
    }]);
  }]);
})();
