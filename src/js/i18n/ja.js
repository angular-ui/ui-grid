(function() {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ja', {
        aggregate: {
          label: '件'
        },
        groupPanel: {
          description: '列名部分をここにドラッグアンドドロップすることで列ごとにグループ分けを行うことができます。'
        },
        search: {
          placeholder: '検索...',
          showingItems: '絞込み件数:',
          selectedItems: '選択件数:',
          totalItems: '全件数:',
          size: 'ページサイズ: ',
          first: '最初のページ',
          next: '次のページ',
          previous: '前のページ',
          last: '最後のページ'
        },
        menu: {
          text: '列選択:'
        },
        sort: {
          ascending: '昇順ソート',
          descending: '降順ソート',
          remove: 'ソート取消'
        },
        column: {
          hide: '列を隠す'
        },
        aggregation: {
          count: '合計件数: ',
          sum: '合計: ',
          avg: '平均: ',
          min: '最小値: ',
          max: '最大値: '
        },
        pinning: {
          pinLeft: '左にピン留め',
          pinRight: '右にピン留め',
          unpin: 'ピン留め取消'
        },
        gridMenu: {
          columns: '列:',
          importerTitle: 'インポートファイル',
          exporterAllAsCsv: '全てのデータをCSV形式でエクスポート',
          exporterVisibleAsCsv: '絞込み済みデータをCSV形式でエクスポート',
          exporterSelectedAsCsv: '選択しているデータをCSV形式でエクスポート',
          exporterAllAsPdf: '全てのデータをPDFでエクスポート',
          exporterVisibleAsPdf: '絞込み済みデータをPDFでエクスポート',
          exporterSelectedAsPdf: '選択しているデータをPDFでエクスポート'
        },
        importer: {
          noHeaders: '列名が抽出できません。ヘッダーは設定されていますか？',
          noObjects: 'データが抽出できません。ファイルにデータは含まれていますか？',
          invalidCsv: '処理を行うことができません。ファイルは有効なCSVファイルですか？',
          invalidJson: '処理を行うことができません。ファイルは有効なJSONファイルですか？',
          jsonNotArray: 'JSONファイルは配列を含んでいる必要があります。処理を中断します。'
        },
        pagination: {
          sizes: '件 / ページ',
          totalItems: '件'
        }
      });
      return $delegate;
    }]);
  }]);
})();
