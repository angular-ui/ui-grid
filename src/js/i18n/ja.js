(function() {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ja', {
        aggregate: {
          label: '項目'
        },
        groupPanel: {
          description: 'ここに列ヘッダをドラッグアンドドロップして、その列でグループ化します。'
        },
        search: {
          placeholder: '検索...',
          showingItems: '表示中の項目:',
          selectedItems: '選択した項目:',
          totalItems: '項目の総数:',
          size: 'ページサイズ:',
          first: '最初のページ',
          next: '次のページ',
          previous: '前のページ',
          last: '前のページ'
        },
        menu: {
          text: '列の選択:'
        },
        sort: {
          ascending: '昇順に並べ替え',
          descending: '降順に並べ替え',
          remove: '並べ替えの解除'
        },
        column: {
          hide: '列の非表示'
        },
        aggregation: {
          count: '合計行数: ',
          sum: '合計: ',
          avg: '平均: ',
          min: '最小: ',
          max: '最大: '
        },
        pinning: {
          pinLeft: '左に固定',
          pinRight: '右に固定',
          unpin: '固定解除'
        },
        gridMenu: {
          columns: '列:',
          importerTitle: 'ファイルのインポート',
          exporterAllAsCsv: 'すべてのデータをCSV形式でエクスポート',
          exporterVisibleAsCsv: '表示中のデータをCSV形式でエクスポート',
          exporterSelectedAsCsv: '選択したデータをCSV形式でエクスポート',
          exporterAllAsPdf: 'すべてのデータをPDF形式でエクスポート',
          exporterVisibleAsPdf: '表示中のデータをPDF形式でエクスポート',
          exporterSelectedAsPdf: '選択したデータをPDF形式でエクスポート',
          clearAllFilters: 'すべてのフィルタを清掃してください'
        },
        importer: {
          noHeaders: '列名を取得できません。ファイルにヘッダが含まれていることを確認してください。',
          noObjects: 'オブジェクトを取得できません。ファイルにヘッダ以外のデータが含まれていることを確認してください。',
          invalidCsv: 'ファイルを処理できません。ファイルが有効なCSV形式であることを確認してください。',
          invalidJson: 'ファイルを処理できません。ファイルが有効なJSON形式であることを確認してください。',
          jsonNotArray: 'インポートしたJSONファイルには配列が含まれている必要があります。処理を中止します。'
        },
        pagination: {
          sizes: '項目/ページ',
          totalItems: '項目'
        }
      });
      return $delegate;
    }]);
  }]);
})();
