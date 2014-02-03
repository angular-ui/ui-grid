/**
 * Created by Tim on 2/1/14.
 */
(function(){
    var uiI18n = angular.module('ui.i18n');
    uiI18n.i18n.add("de",{
        aggregate:{
            label: 'eintrag'
        },
        groupPanel:{
            description: 'Ziehen Sie eine Spaltenüberschrift hierhin um nach dieser Spalte zu gruppieren.'
        },
        search:{
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
        menu:{
            text: 'Spalten auswählen:'
        }
    });
})();