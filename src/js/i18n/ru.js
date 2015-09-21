/**
 * Created by Oleg on 16/08/14.
 * Updated by Duanevsky 12/10/14.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ru', {
        headerCell: {
          aria: {
            defaultFilterLabel: 'Фильтр столбца',
            removeFilter: 'Убрать фильтр',
            columnMenuButtonLabel: 'Меню столбца'
          },
          priority: 'Приоритет:',
          filterLabel: "Филтьр столбца: "
        },
        aggregate: {
          label: 'элементы'
        },
        groupPanel: {
          description: 'Для группировки по столбцу перетащите сюда его название.'
        },
        search: {
          placeholder: 'Поиск...',
          showingItems: 'Показать элементы:',
          selectedItems: 'Выбранные элементы:',
          totalItems: 'Всего элементов:',
          size: 'Размер страницы:',
          first: 'Первая страница',
          next: 'Следующая страница',
          previous: 'Предыдущая страница',
          last: 'Последняя страница'
        },
        menu: {
          text: 'Выбрать столбцы:'
        },
        sort: {
          ascending: 'По возрастанию',
          descending: 'По убыванию',
          none: 'Не сортировать',
          remove: 'Убрать сортировку'
        },
        column: {
          hide: 'Спрятать столбец'
        },
        aggregation: {
          count: 'всего строк: ',
          sum: 'итого: ',
          avg: 'среднее: ',
          min: 'мин: ',
          max: 'макс: '
        },
				pinning: {
					pinLeft: 'Закрепить слева',
					pinRight: 'Закрепить справа',
					unpin: 'Открепить'
				},
        gridMenu: {
          aria: {
            buttonLabel: 'Меню таблицы'
          },
          columns: 'Столбцы:',
          importerTitle: 'Импортировать файл',
          exporterAllAsCsv: 'Экспортировать всё в CSV',
          exporterVisibleAsCsv: 'Экспортировать видимые данные в CSV',
          exporterSelectedAsCsv: 'Экспортировать выбранные данные в CSV',
          exporterAllAsPdf: 'Экспортировать всё в PDF',
          exporterVisibleAsPdf: 'Экспортировать видимые данные в PDF',
          exporterSelectedAsPdf: 'Экспортировать выбранные данные в PDF',
          clearAllFilters: 'Очистите все фильтры'
        },
        importer: {
          noHeaders: 'Не удалось прочитать из файла названия столбцов, есть ли у файла заголовок?',
          noObjects: 'Не удалось прочитать из файла объекты, есть ли в файле данные?',
          invalidCsv: 'Не удалось обработать файл, валидный ли это CSV?',
          invalidJson: 'Не удалось обработать файл, валидный ли это Json?',
          jsonNotArray: 'Импортируемый файл json должен содержать массив, импорт прерван.'
        },
        pagination: {
          aria: {
            pageToFirst: 'На первую',
            pageBack: 'Назад',
            pageSelected: 'Выбрать',
            pageForward: 'Вперёд',
            pageToLast: 'На последнюю'
          },
          sizes: 'элементов на странице',
          totalItems: 'элементов',
          through: 'через',
          of: 'из'
        },
        grouping: {
          group: 'Группировка',
          ungroup: 'Разгруппировка',
          aggregate_count: 'Свод: Счётчик',
          aggregate_sum: 'Свод: Сумма',
          aggregate_max: 'Свод: Макс.',
          aggregate_min: 'Свод: Мин.',
          aggregate_avg: 'Свод: Сред.',
          aggregate_remove: 'Свод: Убрать'
        }
      });
      return $delegate;
    }]);
  }]);
})();
