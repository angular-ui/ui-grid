(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('zh-tw', {
        aggregate: {
          label: '筆'
        },
        groupPanel: {
          description: '拖拉表頭到此處以進行分組'
        },
        search: {
          placeholder: '搜尋...',
          showingItems: '目前顯示筆數：',
          selectedItems: '選取筆數：',
          totalItems: '總筆數：',
          size: '每頁顯示：',
          first: '第一頁',
          next: '下一頁',
          previous: '上一頁',
          last: '最後頁'
        },
        menu: {
          text: '選擇欄位：'
        },
        column: {
          hide: '隐藏列'
        }
      });
      return $delegate;
    }]);
}]);
})();