/**
 * Created by Oleg on 16/08/14.
 * Updated by Duanevsky 12/10/14.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ru', {
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
          columns: 'Столбцы:',
          importerTitle: 'Import file',
          exporterAllAsCsv: 'Экспортировать всё в CSV',
          exporterVisibleAsCsv: 'Экспортировать видимые данные в CSV',
          exporterSelectedAsCsv: 'Экспортировать выбранные данные в CSV',
          exporterAllAsPdf: 'Экспортировать всё в PDF',
          exporterVisibleAsPdf: 'Экспортировать видимые данные в PDF',
          exporterSelectedAsPdf: 'Экспортировать выбранные данные в PDF',
          clearAllFilters: 'Очистите все фильтры'
        },
        importer: {
          noHeaders: 'Не удалось получить названия столбцов, есть ли в файле заголовок?',
          noObjects: 'Не удалось получить данные, есть ли в файле строки кроме заголовка?',
          invalidCsv: 'Не удалось обработать файл, это правильный CSV-файл?',
          invalidJson: 'Не удалось обработать файл, это правильный JSON?',
          jsonNotArray: 'Импортируемый JSON-файл должен содержать массив, операция отменена.'
        }
      });
      return $delegate;
    }]);
  }]);
})();
