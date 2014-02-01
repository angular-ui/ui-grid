(function(){
    var uiI18n = angular.module('ui.i18n');
    uiI18n.i18n.add('es',{
        aggregate:{
            label: 'Artículos'
        },
        groupPanel:{
            description: 'Arrastre un encabezado de columna aquí y soltarlo para agrupar por esa columna.'
        },
        search:{
            placeholder: 'Buscar...',
            showingItems: 'Artículos Mostrando:',
            selectedItems: 'Artículos Seleccionados:',
            totalItems: 'Artículos Totales:',
            size: 'Tamaño de Página:',
            first: 'Primera Página',
            next: 'Página Siguiente',
            previous: 'Página Anterior',
            last: 'Última Página'
        },
        menu:{
            text: 'Elegir columnas:',
        }
    });
})();