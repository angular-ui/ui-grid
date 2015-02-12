/**
 * Created by Tim on 2/1/14.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function ($provide) {
    $provide.decorator('i18nService', ['$delegate', function ($delegate) {
      $delegate.add('de', {
        aggregate: {
          label: 'Eintrag'
        },
        groupPanel: {
          description: 'Ziehen Sie eine Spaltenüberschrift hierhin, um nach dieser Spalte zu gruppieren.'
        },
        search: {
          placeholder: 'Suche...',
          showingItems: 'Zeige Einträge:',
          selectedItems: 'Ausgewählte Einträge:',
          totalItems: 'Einträge gesamt:',
          size: 'Einträge pro Seite:',
          first: 'Erste Seite',
          next: 'Nächste Seite',
          previous: 'Vorherige Seite',
          last: 'Letzte Seite'
        },
        menu: {
          text: 'Spalten auswählen:'
        },
        sort: {
          ascending: 'aufsteigend sortieren',
          descending: 'absteigend sortieren',
          remove: 'Sortierung zurücksetzen'
        },
        column: {
          hide: 'Spalte ausblenden'
        },
        aggregation: {
          count: 'Zeilen insgesamt: ',
          sum: 'gesamt: ',
          avg: 'Durchschnitt: ',
          min: 'min: ',
          max: 'max: '
        },
        pinning: {
            pinLeft: 'Links anheften',
            pinRight: 'Rechts anheften',
            unpin: 'Lösen'
        },
        gridMenu: {
          columns: 'Spalten:',
          importerTitle: 'Datei importieren',
          exporterAllAsCsv: 'Alle Daten als CSV exportieren',
          exporterVisibleAsCsv: 'sichtbare Daten als CSV exportieren',
          exporterSelectedAsCsv: 'markierte Daten als CSV exportieren',
          exporterAllAsPdf: 'Alle Daten als PDF exportieren',
          exporterVisibleAsPdf: 'sichtbare Daten als PDF exportieren',
          exporterSelectedAsPdf: 'markierte Daten als CSV exportieren'
        },
        importer: {
          noHeaders: 'Es konnten keine Spaltennamen ermittelt werden. Sind in der Datei Spaltendefinitionen enthalten?',
          noObjects: 'Es konnten keine Zeileninformationen gelesen werden, Sind in der Datei außer den Spaltendefinitionen auch Daten enthalten?',
          invalidCsv: 'Die Datei konnte nicht eingelesen werden, ist es eine gültige CSV-Datei?',
          invalidJson: 'Die Datei konnte nicht eingelesen werden. Enthält sie gültiges JSON?',
          jsonNotArray: 'Die importierte JSON-Datei muß ein Array enthalten. Breche Import ab.'
        },
        pagination: {
            sizes: 'Einträge pro Seite',
            totalItems: 'Einträge'
        }
      });
      return $delegate;
    }]);
  }]);
})();
