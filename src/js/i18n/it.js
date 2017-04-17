/**
 * Transleted by Andrea on 2015-11-23.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('it', {
        headerCell: {
          aria: {
            defaultFilterLabel: 'Filtra per colonna',
            removeFilter: 'Rimuovi filtro',
            columnMenuButtonLabel: 'Menu colonna'
          },
          priority: 'Priorita:',
          filterLabel: "Filtra per colonna: "
        },
        aggregate: {
          label: 'elementi'
        },
        groupPanel: {
          description: 'Trascina qui l\'intestazione di una colonna se vuoi raggruppare per quella colonna.'
        },
        search: {
          placeholder: 'Cerca...',
          showingItems: 'Elementi visualizzati:',
          selectedItems: 'Elementi selezionati:',
          totalItems: 'Elementi totali:',
          size: 'Dimensione di pagina:',
          first: 'Prima pagina',
          next: 'Pagina successiva',
          previous: 'Pagina precedente',
          last: 'Ultima pagina'
        },
        menu: {
          text: 'Colonne selezionate:'
        },
        sort: {
          ascending: 'Ord. crescente',
          descending: 'Ord. decrescente',
          none: 'Nessun ord.',
          remove: 'Rimuovi ord.'
        },
        column: {
          hide: 'Nascondi colonna'
        },
        aggregation: {
          count: 'righe totali: ',
          sum: 'totale: ',
          avg: 'media: ',
          min: 'min: ',
          max: 'max: '
        },
        pinning: {
          pinLeft: 'Blocca a sinistra',
          pinRight: 'Blocca a destra',
          unpin: 'Sblocca'
        },
        columnMenu: {
          close: 'Chiudi'
        },
        gridMenu: {
          aria: {
            buttonLabel: 'Menu griglia'
          },
          columns: 'Colonne:',
          importerTitle: 'Importa file',
          exporterAllAsCsv: 'Esporta tutti i dati come CSV',
          exporterVisibleAsCsv: 'Esporta i dati visibili come CSV',
          exporterSelectedAsCsv: 'Esporta i dati selezionati come CSV',
          exporterAllAsPdf: 'Esporta tutti i dati come PDF',
          exporterVisibleAsPdf: 'Esporta i dati visibili come PDF',
          exporterSelectedAsPdf: 'Esporta i dati selezionati come PDF',
          clearAllFilters: 'Cancella tutti i filtri'
        },
        importer: {
          noHeaders: 'Impossibile ricavare i nomi delle colonne, il file ha un\'intestazione?',
          noObjects: 'Impossibile ricavare gli oggetti, il file contiene dati oltre che intestazioni?',
          invalidCsv: 'Impossibile processare il file, e\' un CSV valido?',
          invalidJson: 'Impossibile processare il file, e\' un PDF valido?',
          jsonNotArray: 'Il JSON importato deve contenere un array, interrompo.'
        },
        pagination: {
          aria: {
            pageToFirst: 'Prima pagina',
            pageBack: 'Pagina precedente',
            pageSelected: 'Pagina selezionata',
            pageForward: 'Pagina successiva',
            pageToLast: 'Ultima pagina'
          },
          sizes: 'elementi per pagina',
          totalItems: 'elementi',
          through: 'per',
          of: 'di'
        },
        pagination: {
          aria: {
            pageToFirst: 'Prima',
            pageBack: 'Indietro',
            pageSelected: 'Pagina selezionata',
            pageForward: 'Avanti',
            pageToLast: 'Ultima'
          },
          sizes: 'elementi per pagina',
          totalItems: 'elementi',
          through: 'a',
          of: 'di'
        },
        grouping: {
          group: 'Raggruppa',
          ungroup: 'Separa',
          aggregate_count: 'Agg: Conta',
          aggregate_sum: 'Agg: Somma',
          aggregate_max: 'Agg: Max',
          aggregate_min: 'Agg: Min',
          aggregate_avg: 'Agg: Media',
          aggregate_remove: 'Agg: Rimuovi'
        },
        validate: {
          error: 'Errore:',
          minLength: 'Lunghezza minima pari a THRESHOLD caratteri.',
          maxLength: 'Lunghezza massima pari a THRESHOLD caratteri.',
          required: 'Necessario inserire un valore.'
        }
      });
      return $delegate;
    }]);
  }]);
})();
