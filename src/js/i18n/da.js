(function(){
    var uiI18n = angular.module('ui.i18n');
    uiI18n.i18n.add('da',{
        aggregate:{
            label: 'artikler'
        },
        groupPanel:{
            description: 'Grupér rækker udfra en kolonne ved at trække dens overskift hertil.'
        },
        search:{
            placeholder: 'Søg...',
            showingItems: 'Viste rækker:',
            selectedItems: 'Valgte rækker:',
            totalItems: 'Rækker totalt:',
            size: 'Side størrelse:',
            first: 'Første side',
            next: 'Næste side',
            previous: 'Forrige side',
            last: 'Sidste side'
        },
        menu:{
            text: 'Vælg kolonner:',
        }
    });
})();