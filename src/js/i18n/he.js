/**
 * Created by Ran Rosenmann on 07/08/2014.
 */
(function () {
    angular.module('ui.grid').config(['$provide', function ($provide) {
        $provide.decorator('i18nService', ['$delegate', function ($delegate) {
            $delegate.add('he', {
                aggregate: {
                    label: 'items'
                },
                groupPanel: {
                    description: 'גרור עמודה לכאן ושחרר בכדי לקבץ עמודה זו.'
                },
                search: {
                    placeholder: 'חפש...',
                    showingItems: 'מציג:',
                    selectedItems: 'סה"כ נבחרו:',
                    totalItems: 'סה"כ רשומות:',
                    size: 'תוצאות בדף:',
                    first: 'דף ראשון',
                    next: 'דף הבא',
                    previous: 'דף קודם',
                    last: 'דף אחרון'
                },
                menu: {
                    text: 'בחר עמודות:'
                },
                sort: {
                    ascending: 'סדר עולה',
                    descending: 'סדר יורד',
                    remove: 'בטל'
                },
                column: {
                  hide: 'טור הסתר'
                }
            });
            return $delegate;
        }]);
    }]);
})();