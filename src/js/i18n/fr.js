(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('fr', {
        aggregate: {
          label: 'articles'
        },
        groupPanel: {
          description: 'Faites glisser un en-tête de colonne ici et déposez-le vers un groupe par cette colonne.'
        },
        search: {
          placeholder: 'Recherche...',
          showingItems: 'Articles Affichage des:',
          selectedItems: 'Éléments Articles:',
          totalItems: 'Nombre total d\'articles:',
          size: 'Taille de page:',
          first: 'Première page',
          next: 'Page Suivante',
          previous: 'Page précédente',
          last: 'Dernière page'
        },
        menu: {
          text: 'Choisir des colonnes:'
        },
        sort: {
          ascending: 'Trier par ordre croissant',
          descending: 'Trier par ordre décroissant',
          remove: 'Enlever le tri'
        },
        column: {
          hide: 'Cacher la colonne'
        },
        aggregation: {
          count: 'total lignes: ',
          sum: 'total: ',
          avg: 'moy: ',
          min: 'min: ',
          max: 'max: '
        },
        pinning: {
          pinLeft: 'Épingler à gauche',
          pinRight: 'Épingler à droite',
          unpin: 'Détacher'
        },
        gridMenu: {
          columns: 'Colonnes:',
          importerTitle: 'Importer un fichier',
          exporterAllAsCsv: 'Exporter toutes les données en CSV',
          exporterVisibleAsCsv: 'Exporter les données visibles en CSV',
          exporterSelectedAsCsv: 'Exporter les données sélectionnées en CSV',
          exporterAllAsPdf: 'Exporter toutes les données en PDF',
          exporterVisibleAsPdf: 'Exporter les données visibles en PDF',
          exporterSelectedAsPdf: 'Exporter les données sélectionnées en PDF'
        },
        importer: {
          noHeaders: 'Impossible de déterminer le nom des colonnes, le fichier possède-t-il un en-tête ?',
          noObjects: 'Aucun objet trouvé, le fichier possède-t-il des données autres que l\'en-tête ?',
          invalidCsv: 'Le fichier n\'a pas pu être traité, le CSV est-il valide ?',
          invalidJson: 'Le fichier n\'a pas pu être traité, le JSON est-il valide ?',
          jsonNotArray: 'Le fichier JSON importé doit contenir un tableau. Abandon.'
        }
      });
      return $delegate;
    }]);
}]);
})();