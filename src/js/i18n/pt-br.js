(function(){
    var uiI18n = angular.module('ui.i18n');
    uiI18n.i18n.add('pt-br',{
        aggregate:{
            label: 'itens',
        },
        groupPanel:{
            description: 'Arraste e solte uma coluna aqui para agrupar por essa coluna'
        },
        search:{
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
        menu:{
            text: 'Selecione as colunas:'
        }
    });
})();