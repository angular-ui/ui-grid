(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('zh-cn', {
        aggregate: {
          label: '条目'
        },
        groupPanel: {
          description: '拖曳表头到此处以进行分组'
        },
        search: {
          placeholder: '搜索...',
          showingItems: '当前显示条目：',
          selectedItems: '选中条目：',
          totalItems: '条目总数：',
          size: '每页显示数：',
          first: '回到首页',
          next: '下一页',
          previous: '上一页',
          last: '前往尾页'
        },
        menu: {
          text: '数据分组与选择列：'
        },
        column: {
          hide: '隐藏列'
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
          exporterSelectedAsPdf: 'Export selected data as pdf'
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
