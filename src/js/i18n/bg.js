(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('bg', {
        headerCell: {
          aria: {
            defaultFilterLabel: 'Филтър за колоната',
            removeFilter: 'Премахване на филтъра',
            columnMenuButtonLabel: 'Меню на колоната'
          },
          priority: 'Приоритет:',
          filterLabel: "Филтър за колоната: "
        },
        aggregate: {
          label: 'обекти'
        },
        
        search: {
          placeholder: 'Търсене...',
          showingItems: 'Показване на обекти:',
          selectedItems: 'Избрани:',
          totalItems: 'Общо:',
          size: 'Размер на страницата:',
          first: 'Първа страница',
          next: 'Следваща страница',
          previous: 'Предишна страница',
          last: 'Последна страница'
        },
        menu: {
          text: 'Изберете колони:'
        },
        sort: {
          ascending: 'Възходящ ред',
          descending: 'Низходящ ред',
          remove: 'Премахване на сортирането'
        },
        column: {
          hide: 'Скрий колоната'
        },
        aggregation: {
          count: 'общо редове: ',
          sum: 'общо: ',
          avg: 'средно: ',
          min: 'минимално: ',
          max: 'максимално: '
        },
        pinning: {
          pinLeft: 'Прикрепяне вляво',
          pinRight: 'Прикрепяне вдясно'
        },
        columnMenu: {
          close: 'Затваряне'
        },
        gridMenu: {
          aria: {
            buttonLabel: 'Меню на грида'
          },
          columns: 'Колони:',
          importerTitle: 'Импортиране на файл',
          exporterAllAsCsv: 'Експортиране на всички данни като csv',
          exporterVisibleAsCsv: 'Експортиране на видимите данни като csv',
          exporterSelectedAsCsv: 'Експортиране на избраните данни като csv',
          exporterAllAsPdf: 'Експортиране на всички данни като pdf',
          exporterVisibleAsPdf: 'Експортиране на видимите данни като pdf',
          exporterSelectedAsPdf: 'Експортиране на избраните данни като pdf',
          clearAllFilters: 'Изчистване на всички филтри'
        },
        importer: {
          noHeaders: 'Имената на колоните не можаха да бъдат получени, файлът има ли хедър?',
          noObjects: 'Обектите не можаха да бъдат получени, има ли други данни във файла освен хедъри?',
          invalidCsv: 'Файлът не беше обработен. Уверете се, че е валиден CSV файл',
          invalidJson: 'Файлът не беше обработен. Уверете се, че е валиден JSON файл',
          jsonNotArray: 'Импортираният json файл трябва да съдържа масив, прекратяване.'
        },
        pagination: {
          aria: {
            pageToFirst: 'Към първа страница',
            pageBack: 'Предишна страница',
            pageSelected: 'Избрана страница',
            pageForward: 'Следваща страница',
            pageToLast: 'Към последната страница'
          },
          sizes: 'обекта на страница',
          totalItems: 'обекта',
          of: 'от'
        },
        grouping: {
          group: 'Групиране',
          ungroup: 'Разгрупиране',
          aggregate_count: 'Сбор: Брой',
          aggregate_sum: 'Сбор: Сума',
          aggregate_max: 'Сбор: Максимум',
          aggregate_min: 'Сбор: Минимум',
          aggregate_avg: 'Сбор: Средно',
          aggregate_remove: 'Сбор: Премахване'
        },
        validate: {
          error: 'Грешка:',
          minLength: 'Стойността трябва да съдържа поне THRESHOLD символа.',
          maxLength: 'Стойността трябва да бъде най-много THRESHOLD символа.',
          required: 'Необходима е стойност.'
        }
      });
      return $delegate;
    }]);
  }]);
})();
