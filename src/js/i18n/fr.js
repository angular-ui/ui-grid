(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('fr', {
        aggregate: {
          label: 'éléments'
        },
        groupPanel: {
          description: 'Faites glisser une en-tête de colonne ici pour créer un groupe de colonnes.'
        },
        search: {
          placeholder: 'Recherche...',
          showingItems: 'Affichage des éléments :',
          selectedItems: 'Éléments sélectionnés :',
          totalItems: 'Nombre total d\'éléments:',
          size: 'Taille de page:',
          first: 'Première page',
          next: 'Page Suivante',
          previous: 'Page précédente',
          last: 'Dernière page'
        },
        menu: {
          text: 'Choisir des colonnes :'
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
          count: 'lignes totales: ',
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
          exporterSelectedAsPdf: 'Exporter les données sélectionnées en PDF',
          clearAllFilters: 'Nettoyez tous les filtres'
        },
        importer: {
          noHeaders: 'Impossible de déterminer le nom des colonnes, le fichier possède-t-il une en-tête ?',
          noObjects: 'Aucun objet trouvé, le fichier possède-t-il des données autres que l\'en-tête ?',
          invalidCsv: 'Le fichier n\'a pas pu être traité, le CSV est-il valide ?',
          invalidJson: 'Le fichier n\'a pas pu être traité, le JSON est-il valide ?',
          jsonNotArray: 'Le fichier JSON importé doit contenir un tableau, abandon.'
        },
        pagination: {
          sizes: 'éléments par page',
          totalItems: 'éléments',
          of: 'sur'
        },
        grouping: {
          group: 'Grouper',
          ungroup: 'Dégrouper',
          aggregate_count: 'Agg: Compte',
          aggregate_sum: 'Agg: Somme',
          aggregate_max: 'Agg: Max',
          aggregate_min: 'Agg: Min',
          aggregate_avg: 'Agg: Moy',
          aggregate_remove: 'Agg: Retirer'
        }
      });
      return $delegate;
    }]);
  }]);
})();
