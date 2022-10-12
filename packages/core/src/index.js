// core
require('./js/bootstrap');
require('./js/constants');

// i18n
require('./js/services/ui-i18n')
require('./js/en');

// services
require('./js/services/ui-grid-util');
require('./js/services/rowSorter');
require('./js/services/rowSearcher');

// factories
require('./js/factories/GridOptions');
require('./js/factories/GridColumn');
require('./js/factories/GridRow');
require('./js/factories/GridApi');
require('./js/factories/GridRenderContainer');
require('./js/factories/ScrollEvent');
require('./js/factories/Grid');
require('./js/factories/GridRowColumn');
require('./js/services/gridClassFactory');

// directives
require('./js/directives/ui-grid-cell');
require('./js/directives/ui-grid-column-menu');
require('./js/directives/ui-grid-filter');
require('./js/directives/ui-grid-footer-cell');
require('./js/directives/ui-grid-footer');
require('./js/directives/ui-grid-grid-footer');
require('./js/directives/ui-grid-header-cell');
require('./js/directives/ui-grid-header');
require('./js/directives/ui-grid-menu-button');
require('./js/directives/ui-grid-menu');
require('./js/directives/ui-grid-one-bind');
require('./js/directives/ui-grid-render-container');
require('./js/directives/ui-grid-row');
require('./js/directives/ui-grid-style');
require('./js/directives/ui-grid-viewport');
require('./js/directives/ui-grid-visible');
require('./js/directives/ui-grid');
require('./js/directives/ui-pinned-container');

// templates
require('./templates/ui-grid');
