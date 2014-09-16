/**
* Created by L007 on 2/1/14.
*/
(function () {
angular.module('ui.grid').config(['$provide', function($provide) {
$provide.decorator('i18nService', ['$delegate', function($delegate) {
$delegate.add('sk', {
aggregate: {
label: 'items'
},
groupPanel: {
description: 'Pretiahni sem názov stĺpca pre zoskupenie podľa toho stĺpca.'
},
search: {
placeholder: 'Hľadaj...',
showingItems: 'Zobrazujem položky:',
selectedItems: 'Vybraté položky:',
totalItems: 'Počet položiek:',
size: 'Počet:',
first: 'Prvá strana',
next: 'Ďalšia strana',
previous: 'Predchádzajúca strana',
last: 'Posledná strana'
},
menu: {
text: 'Vyberte stĺpce:'
},
sort: {
ascending: 'Zotriediť vzostupne',
descending: 'Zotriediť zostupne',
remove: 'Vymazať triedenie'
}
});
return $delegate;
}]);
}]);
})();
