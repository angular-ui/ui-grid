/**
 * Altered by raul on 24/03/2015 (leaving theses lines makes it easier to compare with en.js)
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('pt-br', {
        aggregate: {
          label: 'itens'
        },
        groupPanel: {
          description: 'Arraste e solte uma coluna aqui para agrupar por essa coluna'
        },
        search: {
          placeholder: 'Procurar...',
          showingItems: 'Mostrando os Itens:',
          selectedItems: 'Items Selecionados:',
          totalItems: 'Total de Itens:',
          size: 'Tamanho da Página:',
          first: 'Primeira Página',
          next: 'Próxima Página',
          previous: 'Página Anterior',
          last: 'Última Página'
        },
        menu: {
          text: 'Selecione as colunas:'
        },
        sort: {
          ascending: 'Ordenar Ascendente',
          descending: 'Ordenar Descendente',
          remove: 'Remover Ordenação'
        },
        column: {
          hide: 'Esconder coluna'
        },
        aggregation: {
          count: 'total de linhas: ',
          sum: 'total: ',
          avg: 'med: ',
          min: 'min: ',
          max: 'max: '
        },
        pinning: {
          pinLeft: 'Fixar Esquerda',
          pinRight: 'Fixar Direita',
          unpin: 'Desprender'
        },
        gridMenu: {
          columns: 'Colunas:',
          importerTitle: 'Importar arquivo',
          exporterAllAsCsv: 'Exportar todos os dados como csv',
          exporterVisibleAsCsv: 'Exportar dados visíveis como csv',
          exporterSelectedAsCsv: 'Exportar dados selecionados como csv',
          exporterAllAsPdf: 'Exportar todos os dados como pdf',
          exporterVisibleAsPdf: 'Exportar dados visíveis como pdf',
          exporterSelectedAsPdf: 'Exportar dados selecionados como pdf',
          clearAllFilters: 'Limpar todos os filtros'
        },
        importer: {
          noHeaders: 'Nomes de colunas não puderam ser derivados. O arquivo tem um cabeçalho?',
          noObjects: 'Objetos não puderam ser derivados. Havia dados no arquivo, além dos cabeçalhos?',
          invalidCsv: 'Arquivo não pode ser processado. É um CSV válido?',
          invalidJson: 'Arquivo não pode ser processado. É um Json válido?',
          jsonNotArray: 'Arquivo json importado tem que conter um array. Abortando.'
        },
        pagination: {
          sizes: 'itens por página',
          totalItems: 'itens'
        },
        grouping: {
          group: 'Agrupar',
          ungroup: 'Desagrupar',
          aggregate_count: 'Agr: Contar',
          aggregate_sum: 'Agr: Soma',
          aggregate_max: 'Agr: Max',
          aggregate_min: 'Agr: Min',
          aggregate_avg: 'Agr: Med',
          aggregate_remove: 'Agr: Remover'
        }
      });
      return $delegate;
    }]);
}]);
})();
