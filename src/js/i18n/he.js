/* jshint -W100 */
/**
 * Created by Ran Rosenmann on 07/08/2014.
 */
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('he', {
        aggregate: {
          label: '������'
        },
        groupPanel: {
          description: '���� ����� ����� ���� �� ��� ���� ��� ����� ��'
        },
        search: {
          placeholder: '���...',
          showingItems: '����:',
          selectedItems: '��"� �����:',
          totalItems: '��"� ������:',
          size: '������ ���:',
          first: '�� �����',
          next: '�� ���',
          previous: '�� ����',
          last: '�� �����'
        },
        menu: {
          text: '��� ������:'
        },
        sort: {
          ascending: '��� ����',
          descending: '��� ����',
          remove: '���'
        }
      });
      return $delegate;
    }]);
  }]);
})();