(function () {
  angular.module('ui.i18n').service('ui-i18n-pt-br', ['ui-i18nService',
    function (i18nService) {
      i18nService.add('pt-br', {
        aggregate: {
          label: 'itens',
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
        }
      });
    }]);
})();