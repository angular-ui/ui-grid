(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name ui.grid.service:uiGridConstants
   * @description Constants for use across many grid features
   *
   */


  angular.module('ui.grid').constant('uiGridConstants', {
    LOG_DEBUG_MESSAGES: true,
    LOG_WARN_MESSAGES: true,
    LOG_ERROR_MESSAGES: true,
    CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
    COL_FIELD: /COL_FIELD/g,
    MODEL_COL_FIELD: /MODEL_COL_FIELD/g,
    TOOLTIP: /title=\"TOOLTIP\"/g,
    DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
    TEMPLATE_REGEXP: /<.+>/,
    FUNC_REGEXP: /(\([^)]*\))?$/,
    DOT_REGEXP: /\./g,
    APOS_REGEXP: /'/g,
    BRACKET_REGEXP: /^(.*)((?:\s*\[\s*\d+\s*\]\s*)|(?:\s*\[\s*"(?:[^"\\]|\\.)*"\s*\]\s*)|(?:\s*\[\s*'(?:[^'\\]|\\.)*'\s*\]\s*))(.*)$/,
    COL_CLASS_PREFIX: 'ui-grid-col',
    ENTITY_BINDING: '$$this',
    events: {
      GRID_SCROLL: 'uiGridScroll',
      COLUMN_MENU_SHOWN: 'uiGridColMenuShown',
      ITEM_DRAGGING: 'uiGridItemDragStart', // For any item being dragged
      COLUMN_HEADER_CLICK: 'uiGridColumnHeaderClick'
    },
    // copied from http://www.lsauer.com/2011/08/javascript-keymap-keycodes-in-json.html
    keymap: {
      TAB: 9,
      STRG: 17,
      CAPSLOCK: 20,
      CTRL: 17,
      CTRLRIGHT: 18,
      CTRLR: 18,
      SHIFT: 16,
      RETURN: 13,
      ENTER: 13,
      BACKSPACE: 8,
      BCKSP: 8,
      ALT: 18,
      ALTR: 17,
      ALTRIGHT: 17,
      SPACE: 32,
      WIN: 91,
      MAC: 91,
      FN: null,
      PG_UP: 33,
      PG_DOWN: 34,
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      ESC: 27,
      DEL: 46,
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123
    },
     /**
     * @ngdoc object
     * @name ASC
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used in {@link ui.grid.class:GridOptions.columnDef#properties_sort columnDef.sort} and
     * {@link ui.grid.class:GridOptions.columnDef#properties_sortDirectionCycle columnDef.sortDirectionCycle}
     * to configure the sorting direction of the column
     */
    ASC: 'asc',
     /**
     * @ngdoc object
     * @name DESC
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used in {@link ui.grid.class:GridOptions.columnDef#properties_sort columnDef.sort} and
     * {@link ui.grid.class:GridOptions.columnDef#properties_sortDirectionCycle columnDef.sortDirectionCycle}
     * to configure the sorting direction of the column
     */
    DESC: 'desc',


     /**
     * @ngdoc object
     * @name filter
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used in {@link ui.grid.class:GridOptions.columnDef#properties_filter columnDef.filter}
     * to configure filtering on the column
     *
     * `SELECT` and `INPUT` are used with the `type` property of the filter, the rest are used to specify
     * one of the built-in conditions.
     *
     * Available `condition` options are:
     * - `uiGridConstants.filter.STARTS_WITH`
     * - `uiGridConstants.filter.ENDS_WITH`
     * - `uiGridConstants.filter.CONTAINS`
     * - `uiGridConstants.filter.GREATER_THAN`
     * - `uiGridConstants.filter.GREATER_THAN_OR_EQUAL`
     * - `uiGridConstants.filter.LESS_THAN`
     * - `uiGridConstants.filter.LESS_THAN_OR_EQUAL`
     * - `uiGridConstants.filter.NOT_EQUAL`
     * - `uiGridConstants.filter.STARTS_WITH`
     *
     *
     * Available `type` options are:
     * - `uiGridConstants.filter.SELECT` - use a dropdown box for the cell header filter field
     * - `uiGridConstants.filter.INPUT` - use a text box for the cell header filter field
     */
    filter: {
      STARTS_WITH: 2,
      ENDS_WITH: 4,
      EXACT: 8,
      CONTAINS: 16,
      GREATER_THAN: 32,
      GREATER_THAN_OR_EQUAL: 64,
      LESS_THAN: 128,
      LESS_THAN_OR_EQUAL: 256,
      NOT_EQUAL: 512,
      SELECT: 'select',
      INPUT: 'input'
    },

    /**
     * @ngdoc object
     * @name aggregationTypes
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used in {@link ui.grid.class:GridOptions.columnDef#properties_aggregationType columnDef.aggregationType}
     * to specify the type of built-in aggregation the column should use.
     *
     * Available options are:
     * - `uiGridConstants.aggregationTypes.sum` - add the values in this column to produce the aggregated value
     * - `uiGridConstants.aggregationTypes.count` - count the number of rows to produce the aggregated value
     * - `uiGridConstants.aggregationTypes.avg` - average the values in this column to produce the aggregated value
     * - `uiGridConstants.aggregationTypes.min` - use the minimum value in this column as the aggregated value
     * - `uiGridConstants.aggregationTypes.max` - use the maximum value in this column as the aggregated value
     */
    aggregationTypes: {
      sum: 2,
      count: 4,
      avg: 8,
      min: 16,
      max: 32
    },

    /**
     * @ngdoc array
     * @name CURRENCY_SYMBOLS
     * @propertyOf ui.grid.service:uiGridConstants
     * @description A list of all presently circulating currency symbols that was copied from
     * https://en.wikipedia.org/wiki/Currency_symbol#List_of_presently-circulating_currency_symbols
     *
     * Can be used on {@link ui.grid.class:rowSorter} to create a number string regex that ignores currency symbols.
     */
    CURRENCY_SYMBOLS: ['¤', '؋', 'Ar', 'Ƀ', '฿', 'B/.', 'Br', 'Bs.', 'Bs.F.', 'GH₵', '¢', 'c', 'Ch.', '₡', 'C$', 'D', 'ден',
      'دج', '.د.ب', 'د.ع', 'JD', 'د.ك', 'ل.د', 'дин', 'د.ت', 'د.م.', 'د.إ', 'Db', '$', '₫', 'Esc', '€', 'ƒ', 'Ft', 'FBu',
      'FCFA', 'CFA', 'Fr', 'FRw', 'G', 'gr', '₲', 'h', '₴', '₭', 'Kč', 'kr', 'kn', 'MK', 'ZK', 'Kz', 'K', 'L', 'Le', 'лв',
      'E', 'lp', 'M', 'KM', 'MT', '₥', 'Nfk', '₦', 'Nu.', 'UM', 'T$', 'MOP$', '₱', 'Pt.', '£', 'ج.م.', 'LL', 'LS', 'P', 'Q',
      'q', 'R', 'R$', 'ر.ع.', 'ر.ق', 'ر.س', '៛', 'RM', 'p', 'Rf.', '₹', '₨', 'SRe', 'Rp', '₪', 'Ksh', 'Sh.So.', 'USh', 'S/',
      'SDR', 'сом', '৳	', 'WS$', '₮', 'VT', '₩', '¥', 'zł'],

    /**
     * @ngdoc object
     * @name scrollDirection
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Set on {@link ui.grid.class:Grid#properties_scrollDirection Grid.scrollDirection},
     * to indicate the direction the grid is currently scrolling in
     *
     * Available options are:
     * - `uiGridConstants.scrollDirection.UP` - set when the grid is scrolling up
     * - `uiGridConstants.scrollDirection.DOWN` - set when the grid is scrolling down
     * - `uiGridConstants.scrollDirection.LEFT` - set when the grid is scrolling left
     * - `uiGridConstants.scrollDirection.RIGHT` - set when the grid is scrolling right
     * - `uiGridConstants.scrollDirection.NONE` - set when the grid is not scrolling, this is the default
     */
    scrollDirection: {
      UP: 'up',
      DOWN: 'down',
      LEFT: 'left',
      RIGHT: 'right',
      NONE: 'none'

    },

    /**
     * @ngdoc object
     * @name dataChange
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used with {@link ui.grid.core.api:PublicApi#methods_notifyDataChange PublicApi.notifyDataChange},
     * {@link ui.grid.class:Grid#methods_callDataChangeCallbacks Grid.callDataChangeCallbacks},
     * and {@link ui.grid.class:Grid#methods_registerDataChangeCallback Grid.registerDataChangeCallback}
     * to specify the type of the event(s).
     *
     * Available options are:
     * - `uiGridConstants.dataChange.ALL` - listeners fired on any of these events, fires listeners on all events.
     * - `uiGridConstants.dataChange.EDIT` - fired when the data in a cell is edited
     * - `uiGridConstants.dataChange.ROW` - fired when a row is added or removed
     * - `uiGridConstants.dataChange.COLUMN` - fired when the column definitions are modified
     * - `uiGridConstants.dataChange.OPTIONS` - fired when the grid options are modified
     */
    dataChange: {
      ALL: 'all',
      EDIT: 'edit',
      ROW: 'row',
      COLUMN: 'column',
      OPTIONS: 'options'
    },

    /**
     * @ngdoc object
     * @name scrollbars
     * @propertyOf ui.grid.service:uiGridConstants
     * @description Used with {@link ui.grid.class:GridOptions#properties_enableHorizontalScrollbar GridOptions.enableHorizontalScrollbar}
     * and {@link ui.grid.class:GridOptions#properties_enableVerticalScrollbar GridOptions.enableVerticalScrollbar}
     * to specify the scrollbar policy for that direction.
     *
     * Available options are:
     * - `uiGridConstants.scrollbars.NEVER` - never show scrollbars in this direction
     * - `uiGridConstants.scrollbars.ALWAYS` - always show scrollbars in this direction
     */

    scrollbars: {
      NEVER: 0,
      ALWAYS: 1
      //WHEN_NEEDED: 2
    }
  });

})();
