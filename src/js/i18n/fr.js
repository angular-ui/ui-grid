(function(){
    var uiI18n = angular.module('ui.i18n');
    uiI18n.i18n.add('fr',{
        aggregate:{
            label: 'articles'
        },
        groupPanel:{
            description: 'Faites glisser un en-tête de colonne ici et déposez-le vers un groupe par cette colonne.'
        },
        search:{
            placeholder: 'Recherche...',
            showingItems:  'Articles Affichage des:',
            selectedItems:'Éléments Articles:',
            totalItems: 'Nombre total d\'articles:',
            size: 'Taille de page:',
            first: 'Première page',
            next: 'Page Suivante',
            previous: 'Page précédente',
            last: 'Dernière page'
        },
        menu:{
            text: 'Choisir des colonnes:'
        }
    });
})();