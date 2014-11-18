/* global pdfMake */

(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.exporter
   * @description
   *
   *  # ui.grid.exporter
   * This module provides the ability to exporter data from the grid.  
   * 
   * Data can be exported in a range of formats, and all data, visible 
   * data, or selected rows can be exported, with all columns or visible
   * columns.
   * 
   * No UI is provided, the caller should provide their own UI/buttons 
   * as appropriate, or enable the gridMenu
   * 
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.exporter"></div>
   */

  var module = angular.module('ui.grid.exporter', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.exporter.constant:uiGridExporterConstants
   *
   *  @description constants available in exporter module
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name ALL
   * @description export all data, including data not visible.  Can
   * be set for either rowTypes or colTypes
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name VISIBLE
   * @description export only visible data, including data not visible.  Can
   * be set for either rowTypes or colTypes
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name SELECTED
   * @description export all data, including data not visible.  Can
   * be set only for rowTypes, selection of only some columns is 
   * not supported
   */
  module.constant('uiGridExporterConstants', {
    featureName: 'exporter',
    ALL: 'all',
    VISIBLE: 'visible',
    SELECTED: 'selected',
    CSV_CONTENT: 'CSV_CONTENT',
    LINK_LABEL: 'LINK_LABEL',
    BUTTON_LABEL: 'BUTTON_LABEL'
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.exporter.service:uiGridExporterService
   *
   *  @description Services for exporter feature
   */
  module.service('uiGridExporterService', ['$q', 'uiGridExporterConstants', 'uiGridSelectionConstants', 'gridUtil', '$compile', '$interval', 'i18nService',
    function ($q, uiGridExporterConstants, uiGridSelectionConstants, gridUtil, $compile, $interval, i18nService) {

      var service = {

        initializeGrid: function (grid) {

          //add feature namespace and any properties to grid for needed state
          grid.exporter = {};
          this.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.exporter.api:PublicApi
           *
           *  @description Public Api for exporter feature
           */
          var publicApi = {
            events: {
              exporter: {
              }
            },
            methods: {
              exporter: {
                /**
                 * @ngdoc function
                 * @name csvExport
                 * @methodOf  ui.grid.exporter.api:PublicApi
                 * @description Exports rows from the grid in csv format, 
                 * the data exported is selected based on the provided options
                 * @param {string} rowTypes which rows to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
                 * uiGridExporterConstants.SELECTED
                 * @param {string} colTypes which columns to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE
                 * @param {element} $elm (Optional) A UI element into which the
                 * resulting download link will be placed. 
                 */
                csvExport: function (rowTypes, colTypes, $elm) {
                  service.csvExport(grid, rowTypes, colTypes, $elm);
                },
                /**
                 * @ngdoc function
                 * @name pdfExport
                 * @methodOf  ui.grid.exporter.api:PublicApi
                 * @description Exports rows from the grid in pdf format, 
                 * the data exported is selected based on the provided options
                 * Note that this function has a dependency on pdfMake, all
                 * going well this has been installed for you.
                 * The resulting pdf opens in a new browser window.
                 * @param {string} rowTypes which rows to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
                 * uiGridExporterConstants.SELECTED
                 * @param {string} colTypes which columns to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE
                 */
                pdfExport: function (rowTypes, colTypes) {
                  service.pdfExport(grid, rowTypes, colTypes);
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);
          
          if (grid.api.core.addToGridMenu){
            service.addToMenu( grid );
          } else {
            // order of registration is not guaranteed, register in a little while
            $interval( function() {
              if (grid.api.core.addToGridMenu){
                service.addToMenu( grid );
              }              
            }, 100, 1);
          }

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           * @ngdoc object
           * @name ui.grid.exporter.api:GridOptions
           *
           * @description GridOptions for selection feature, these are available to be  
           * set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           * @ngdoc object
           * @name exporterSuppressMenu
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description Don't show the export menu button, implying the user
           * will roll their own UI for calling the exporter
           * <br/>Defaults to false
           */
          gridOptions.exporterSuppressMenu = gridOptions.exporterSuppressMenu === true;
          /**
           * @ngdoc object
           * @name exporterLinkTemplate
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A custom template to use for the resulting
           * link (for csv export)
           * <br/>Defaults to ui-grid/csvLink
           */
          gridOptions.exporterLinkTemplate = gridOptions.exporterLinkTemplate ? gridOptions.exporterLinkTemplate : 'ui-grid/csvLink';
          /**
           * @ngdoc object
           * @name exporterHeaderTemplate
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A custom template to use for the header
           * section, containing the button and csv download link.  Not
           * needed if you've set suppressButton and are providing a custom
           * $elm into which the download link will go.
           * <br/>Defaults to ui-grid/exporterHeader
           */
          gridOptions.exporterHeaderTemplate = gridOptions.exporterHeaderTemplate ? gridOptions.exporterHeaderTemplate : 'ui-grid/exporterHeader';
          /**
           * @ngdoc object
           * @name exporterLinkLabel
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The text to show on the CSV download
           * link
           * <br/>Defaults to 'Download CSV'
           */
          gridOptions.exporterLinkLabel = gridOptions.exporterLinkLabel ? gridOptions.exporterLinkLabel : 'Download CSV';
          /**
           * @ngdoc object
           * @name exporterMenuLabel
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The text to show on the exporter menu button
           * link
           * <br/>Defaults to 'Export'
           */
          gridOptions.exporterMenuLabel = gridOptions.exporterMenuLabel ? gridOptions.exporterMenuLabel : 'Export';
          /**
           * @ngdoc object
           * @name exporterSuppressColumns
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description Columns that should not be exported.  The selectionRowHeader is already automatically
           * suppressed, but if you had a button column or some other "system" column that shouldn't be shown in the
           * output then add it in this list.  You should provide an array of column names.
           * <br/>Defaults to: []
           * <pre>
           *   gridOptions.exporterSuppressColumns = [ 'buttons' ];
           * </pre>
           */
          gridOptions.exporterSuppressColumns = gridOptions.exporterSuppressColumns ? gridOptions.exporterSuppressColumns : [];
          /**
           * @ngdoc object
           * @name exporterCsvColumnSeparator
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The character to use as column separator
           * link
           * <br/>Defaults to ','
           */
          gridOptions.exporterCsvColumnSeparator = gridOptions.exporterCsvColumnSeparator ? gridOptions.exporterCsvColumnSeparator : ',';
          /**
           * @ngdoc object
           * @name exporterPdfDefaultStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The default style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     fontSize: 11
           *   }
           * </pre>
           */
          gridOptions.exporterPdfDefaultStyle = gridOptions.exporterPdfDefaultStyle ? gridOptions.exporterPdfDefaultStyle : { fontSize: 11 };
          /**
           * @ngdoc object
           * @name exporterPdfTableStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The table style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     margin: [0, 5, 0, 15]
           *   }
           * </pre>
           */
          gridOptions.exporterPdfTableStyle = gridOptions.exporterPdfTableStyle ? gridOptions.exporterPdfTableStyle : { margin: [0, 5, 0, 15] };
          /**
           * @ngdoc object
           * @name exporterPdfTableHeaderStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The tableHeader style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     bold: true,
           *     fontSize: 12,
           *     color: 'black'
           *   }
           * </pre>
           */
          gridOptions.exporterPdfTableHeaderStyle = gridOptions.exporterPdfTableHeaderStyle ? gridOptions.exporterPdfTableHeaderStyle : { bold: true, fontSize: 12, color: 'black' };
          /**
           * @ngdoc object
           * @name exporterPdfHeader
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The header section for pdf exports.  Can be
           * simple text:
           * <pre>
           *   gridOptions.exporterPdfHeader = 'My Header';
           * </pre>
           * Can be a more complex object in pdfMake format:
           * <pre>
           *   gridOptions.exporterPdfHeader = {
           *     columns: [
           *       'Left part',
           *       { text: 'Right part', alignment: 'right' }
           *     ]
           *   };
           * </pre>
           * Or can be a function, allowing page numbers and the like
           * <pre>
           *   gridOptions.exporterPdfHeader: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; };
           * </pre>
           */
          gridOptions.exporterPdfHeader = gridOptions.exporterPdfHeader ? gridOptions.exporterPdfHeader : null;
          /**
           * @ngdoc object
           * @name exporterPdfFooter
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The header section for pdf exports.  Can be
           * simple text:
           * <pre>
           *   gridOptions.exporterPdfFooter = 'My Footer';
           * </pre>
           * Can be a more complex object in pdfMake format:
           * <pre>
           *   gridOptions.exporterPdfFooter = {
           *     columns: [
           *       'Left part',
           *       { text: 'Right part', alignment: 'right' }
           *     ]
           *   };
           * </pre>
           * Or can be a function, allowing page numbers and the like
           * <pre>
           *   gridOptions.exporterPdfFooter: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; };
           * </pre>
           */
          gridOptions.exporterPdfFooter = gridOptions.exporterPdfFooter ? gridOptions.exporterPdfFooter : null;
          /**
           * @ngdoc object
           * @name exporterPdfOrientation
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The orientation, should be a valid pdfMake value,
           * 'landscape' or 'portrait'
           * <br/>Defaults to landscape
           */
          gridOptions.exporterPdfOrientation = gridOptions.exporterPdfOrientation ? gridOptions.exporterPdfOrientation : 'landscape';
          /**
           * @ngdoc object
           * @name exporterPdfPageSize
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The orientation, should be a valid pdfMake
           * paper size, usually 'A4' or 'LETTER'
           * {@link https://github.com/bpampuch/pdfmake/blob/master/src/standardPageSizes.js pdfMake page sizes}
           * <br/>Defaults to A4
           */
          gridOptions.exporterPdfPageSize = gridOptions.exporterPdfPageSize ? gridOptions.exporterPdfPageSize : 'A4';
          /**
           * @ngdoc object
           * @name exporterPdfMaxGridWidth
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The maxium grid width - the current grid width 
           * will be scaled to match this, with any fixed width columns
           * being adjusted accordingly.
           * <br/>Defaults to 720 (for A4 landscape), use 670 for LETTER 
           */
          gridOptions.exporterPdfMaxGridWidth = gridOptions.exporterPdfMaxGridWidth ? gridOptions.exporterPdfMaxGridWidth : 720;
          /**
           * @ngdoc object
           * @name exporterPdfTableLayout
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A tableLayout in pdfMake format, 
           * controls gridlines and the like.  We use the default
           * layout usually.
           * <br/>Defaults to null, which means no layout 
           */

          /**
           * @ngdoc object
           * @name exporterMenuCsv
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description Add csv export menu items to the ui-grid grid menu, if it's present.  Defaults to true.
           */
          gridOptions.exporterMenuCsv = gridOptions.exporterMenuCsv !== undefined ? gridOptions.exporterMenuCsv : true;

          /**
           * @ngdoc object
           * @name exporterMenuPdf
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description Add pdf export menu items to the ui-grid grid menu, if it's present.  Defaults to true.
           */
          gridOptions.exporterMenuPdf = gridOptions.exporterMenuPdf !== undefined ? gridOptions.exporterMenuPdf : true;
          
          /**
           * @ngdoc object
           * @name exporterPdfCustomFormatter
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A custom callback routine that changes the pdf document, adding any
           * custom styling or content that is supported by pdfMake.  Takes in the complete docDefinition, and
           * must return an updated docDefinition ready for pdfMake.
           * @example
           * In this example we add a style to the style array, so that we can use it in our
           * footer definition.
           * <pre>
           *   gridOptions.exporterPdfCustomFormatter = function ( docDefinition ) {
           *     docDefinition.styles.footerStyle = { bold: true, fontSize: 10 };
           *     return docDefinition;
           *   }
           * 
           *   gridOptions.exporterPdfFooter = { text: 'My footer', style: 'footerStyle' }
           * </pre>
           */
          gridOptions.exporterPdfCustomFormatter = ( gridOptions.exporterPdfCustomFormatter && typeof( gridOptions.exporterPdfCustomFormatter ) === 'function' ) ? gridOptions.exporterPdfCustomFormatter : function ( docDef ) { return docDef; };
          
          /**
           * @ngdoc object
           * @name exporterHeaderFilter
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A function to apply to the header displayNames before exporting.  Useful for internationalisation,
           * for example if you were using angular-translate you'd set this to `$translate.instant`.  Note that this
           * call must be synchronous, it cannot be a call that returns a promise.
           * @example
           * <pre>
           *   gridOptions.exporterHeaderFilter = function( displayName ){ return 'col: ' + displayName; };
           * </pre>
           * OR
           * <pre>
           *   gridOptions.exporterHeaderFilter = $translate.instant;
           * </pre>
           */

          /**
           * @ngdoc function
           * @name exporterFieldCallback
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A function to call for each field before exporting it.  Allows 
           * massaging of raw data into a display format, for example if you have applied 
           * filters to convert codes into decodes, or you require
           * a specific date format in the exported content.
           * 
           * The method is called once for each field exported, and provides the grid, the
           * gridCOl and the GridRow for you to use as context in massaging the data.
           * 
           * @param {Grid} grid provides the grid in case you have need of it
           * @param {GridRow} row the row from which the data comes
           * @param {GridCol} col the column from which the data comes
           * @param {object} value the value for your massaging
           * @returns {object} you must return the massaged value ready for exporting
           * 
           * @example
           * <pre>
           *   gridOptions.exporterFieldCallback = function ( grid, row, col, value ){
           *     if ( col.name === 'status' ){
           *       value = decodeStatus( value );
           *     }
           *     return value;
           *   }
           * </pre>
           */
          gridOptions.exporterFieldCallback = gridOptions.exporterFieldCallback ? gridOptions.exporterFieldCallback : function( grid, row, col, value ) { return value; };
        },


        /**
         * @ngdoc function
         * @name addToMenu
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Adds export items to the grid menu,
         * allowing the user to select export options 
         * @param {Grid} grid the grid from which data should be exported
         */
        addToMenu: function ( grid ) {
          grid.api.core.addToGridMenu( grid, [
            {
              title: i18nService.getSafeText('gridMenu.exporterAllAsCsv'),
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.ALL, uiGridExporterConstants.ALL );
              },
              shown: function() {
                return this.grid.options.exporterMenuCsv; 
              }
            },
            {
              title: i18nService.getSafeText('gridMenu.exporterVisibleAsCsv'),
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE );
              },
              shown: function() {
                return this.grid.options.exporterMenuCsv; 
              }
            },
            {
              title: i18nService.getSafeText('gridMenu.exporterSelectedAsCsv'),
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE );
              },
              shown: function() {
                return this.grid.options.exporterMenuCsv &&
                       ( this.grid.api.selection && this.grid.api.selection.getSelectedRows().length > 0 ); 
              }
            },
            {
              title: i18nService.getSafeText('gridMenu.exporterAllAsPdf'),
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.ALL, uiGridExporterConstants.ALL );
              },
              shown: function() {
                return this.grid.options.exporterMenuPdf; 
              }
            },
            {
              title: i18nService.getSafeText('gridMenu.exporterVisibleAsPdf'),
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE );
              },
              shown: function() {
                return this.grid.options.exporterMenuPdf; 
              }
            },
            {
              title: i18nService.getSafeText('gridMenu.exporterSelectedAsPdf'),
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE );
              },
              shown: function() {
                return this.grid.options.exporterMenuPdf &&
                       ( this.grid.api.selection && this.grid.api.selection.getSelectedRows().length > 0 ); 
              }
            }
          ]);
        },
        

        /**
         * @ngdoc object
         * @name exporterCsvLinkElement
         * @propertyOf  ui.grid.exporter.api:GridOptions
         * @description The element that the csv link should be placed into.
         * Mandatory if using the native UI.
         */
        /**
         * @ngdoc function
         * @name csvExport
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Exports rows from the grid in csv format, 
         * the data exported is selected based on the provided options
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {element} $elm (Optional) A UI element into which the
         * resulting download link will be placed. 
         */
        csvExport: function (grid, rowTypes, colTypes, $elm) {
          var exportColumnHeaders = this.getColumnHeaders(grid, colTypes);
          var exportData = this.getData(grid, rowTypes, colTypes);
          var csvContent = this.formatAsCsv(exportColumnHeaders, exportData, grid.options.exporterCsvColumnSeparator);
          
          if ( !$elm && grid.options.exporterCsvLinkElement ){
            $elm = grid.options.exporterCsvLinkElement;
          }
          
          if ( $elm ){
            this.renderCsvLink(grid, csvContent, $elm);
          } else {
            gridUtil.logError( 'Exporter asked to export as csv, but no element provided.  Perhaps you should set gridOptions.exporterCsvLinkElement?')
;          }
        },
        
        
        /**
         * @ngdoc function
         * @name getColumnHeaders
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Gets the column headers from the grid to use
         * as a title row for the exported file, all headers have 
         * headerCellFilters applied as appropriate.
         * 
         * Column headers are an array of objects, each object has
         * name, displayName, width and align attributes.  Only name is
         * used for csv, all attributes are used for pdf.
         * 
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        getColumnHeaders: function (grid, colTypes) {
          var headers = [];
          angular.forEach(grid.columns, function( gridCol, index ) {
            if ( (gridCol.visible || colTypes === uiGridExporterConstants.ALL ) && 
                 gridCol.name !== uiGridSelectionConstants.selectionRowHeaderColName &&
                 grid.options.exporterSuppressColumns.indexOf( gridCol.name ) === -1 ){
              headers.push({
                name: gridCol.field,
                displayName: grid.options.exporterHeaderFilter ? grid.options.exporterHeaderFilter(gridCol.displayName) : gridCol.displayName,
                width: gridCol.drawnWidth ? gridCol.drawnWidth : gridCol.width,
                align: gridCol.colDef.type === 'number' ? 'right' : 'left'
              });
            }
          });
          
          return headers;
        },
        
        
        /**
         * @ngdoc function
         * @name getData
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Gets data from the grid based on the provided options,
         * all cells have cellFilters applied as appropriate
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        getData: function (grid, rowTypes, colTypes) {
          var data = [];
          
          var rows;
          
          switch ( rowTypes ) {
            case uiGridExporterConstants.ALL:
              rows = grid.rows; 
              break;
            case uiGridExporterConstants.VISIBLE:
              rows = grid.getVisibleRows();
              break;
            case uiGridExporterConstants.SELECTED:
              if ( grid.api.selection ){
                rows = grid.api.selection.getSelectedGridRows();
              } else {
                gridUtil.logError('selection feature must be enabled to allow selected rows to be exported');
              }
              break;
          }
          
          if ( uiGridExporterConstants.ALL ) {
            angular.forEach(rows, function( row, index ) {

              var extractedRow = [];
              angular.forEach(grid.columns, function( gridCol, index ) {
              if ( (gridCol.visible || colTypes === uiGridExporterConstants.ALL ) && 
                   gridCol.name !== uiGridSelectionConstants.selectionRowHeaderColName &&
                   grid.options.exporterSuppressColumns.indexOf( gridCol.name ) === -1 ){
                  extractedRow.push( grid.options.exporterFieldCallback( grid, row, gridCol, grid.getCellValue( row, gridCol ) ) );
                }
              });
              
              data.push(extractedRow);
            });
            
            return data;
          }
        },


        /**
         * @ngdoc function
         * @name formatAsCSV
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Formats the column headers and data as a CSV, 
         * and sends that data to the user
         * @param {array} exportColumnHeaders an array of column headers, 
         * where each header is an object with name, width and maybe alignment
         * @param {array} exportData an array of rows, where each row is
         * an array of column data
         * @returns {string} csv the formatted csv as a string
         */
        formatAsCsv: function (exportColumnHeaders, exportData, separator) {
          var self = this;
          
          var bareHeaders = exportColumnHeaders.map(function(header){return header.displayName;});
          
          var csv = self.formatRowAsCsv(this, separator)(bareHeaders) + '\n';
          
          csv += exportData.map(this.formatRowAsCsv(this, separator)).join('\n');
          
          return csv;
        },

        /**
         * @ngdoc function
         * @name formatRowAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a csv field, including
         * quotes around the value
         * @param {exporterService} exporter pass in exporter 
         * @param {array} row the row to be turned into a csv string
         * @returns {string} a csv-ified version of the row
         */
        formatRowAsCsv: function (exporter, separator) {
          return function (row) {
            return row.map(exporter.formatFieldAsCsv).join(separator);
          };
        },
        
        /**
         * @ngdoc function
         * @name formatFieldAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a csv field, including
         * quotes around the value
         * @param {field} field the field to be turned into a csv string,
         * may be of any type
         * @returns {string} a csv-ified version of the field
         */
        formatFieldAsCsv: function (field) {
          if (field == null) { // we want to catch anything null-ish, hence just == not ===
            return '';
          }
          if (typeof(field) === 'number') {
            return field;
          }
          if (typeof(field) === 'boolean') {
            return (field ? 'TRUE' : 'FALSE') ;
          }
          if (typeof(field) === 'string') {
            return '"' + field.replace(/"/g,'""') + '"';
          }

          return JSON.stringify(field);        
        },

        /**
         * @ngdoc function
         * @name renderCsvLink
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Creates a download link with the csv content, 
         * putting it into the default exporter element, or into the element
         * passed in if provided
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} csvContent the csv content that we'd like to 
         * make available as a download link
         * @param {element} $elm (Optional) A UI element into which the
         * resulting download link will be placed.  If not provided, the
         * link is put into the default exporter element. 
         */
        renderCsvLink: function (grid, csvContent, $elm) {
          var targetElm = $elm ? $elm : angular.element( grid.exporter.gridElm[0].querySelectorAll('.ui-grid-exporter-csv-link') );
          if ( angular.element( targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')) ) {
            angular.element( targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')).remove();
          }
          
          var linkTemplate = gridUtil.getTemplate(grid.options.exporterLinkTemplate)
          .then(function (contents) {

              var template = angular.element(contents);

              template.children("a").html(
                  template.children("a").html().replace(
                      uiGridExporterConstants.LINK_LABEL, grid.options.exporterLinkLabel));

              template.children("a").attr("href", 
                  template.children("a").attr("href").replace(
                      uiGridExporterConstants.CSV_CONTENT, encodeURIComponent(csvContent)));
            
            var newElm = $compile(template)(grid.exporter.$scope);
            targetElm.append(newElm);
          });
          
        },
        
        /**
         * @ngdoc function
         * @name pdfExport
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Exports rows from the grid in pdf format, 
         * the data exported is selected based on the provided options.
         * Note that this function has a dependency on pdfMake, which must
         * be installed.  The resulting pdf opens in a new
         * browser window.
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        pdfExport: function (grid, rowTypes, colTypes) {
          var exportColumnHeaders = this.getColumnHeaders(grid, colTypes);
          var exportData = this.getData(grid, rowTypes, colTypes);
          var docDefinition = this.prepareAsPdf(grid, exportColumnHeaders, exportData);
          
          pdfMake.createPdf(docDefinition).open();
        },
        
        
        /**
         * @ngdoc function
         * @name renderAsPdf
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders the data into a pdf, and opens that pdf.
         * 
         * @param {Grid} grid the grid from which data should be exported
         * @param {array} exportColumnHeaders an array of column headers, 
         * where each header is an object with name, width and maybe alignment
         * @param {array} exportData an array of rows, where each row is
         * an array of column data
         * @returns {object} a pdfMake format document definition, ready 
         * for generation
         */        
        prepareAsPdf: function(grid, exportColumnHeaders, exportData) {
          var headerWidths = this.calculatePdfHeaderWidths( grid, exportColumnHeaders );
          
          var headerColumns = exportColumnHeaders.map( function( header ) {
            return { text: header.displayName, style: 'tableHeader' }; 
          });
          
          var stringData = exportData.map(this.formatRowAsPdf(this));
          
          var allData = [headerColumns].concat(stringData);
          
          var docDefinition = {
            pageOrientation: grid.options.exporterPdfOrientation,
            pageSize: grid.options.exporterPdfPageSize,
            content: [{
              style: 'tableStyle',
              table: {
                headerRows: 1,
                widths: headerWidths,
                body: allData 
              }
            }],
            styles: {
              tableStyle: grid.options.exporterPdfTableStyle,
              tableHeader: grid.options.exporterPdfTableHeaderStyle
            },
            defaultStyle: grid.options.exporterPdfDefaultStyle
          };
          
          if ( grid.options.exporterPdfLayout ){
            docDefinition.layout = grid.options.exporterPdfLayout;
          }
          
          if ( grid.options.exporterPdfHeader ){
            docDefinition.content.unshift( grid.options.exporterPdfHeader );
          }
          
          if ( grid.options.exporterPdfFooter ){
            docDefinition.content.push( grid.options.exporterPdfFooter );
          }
          
          if ( grid.options.exporterPdfCustomFormatter ){
            docDefinition = grid.options.exporterPdfCustomFormatter( docDefinition );
          }
          return docDefinition;
          
        },
        
                
        /**
         * @ngdoc function
         * @name calculatePdfHeaderWidths
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Determines the column widths base on the 
         * widths we got from the grid.  If the column is drawn
         * then we have a drawnWidth.  If the column is not visible
         * then we have '*', 'x%' or a width.  When columns are
         * not visible they don't contribute to the overall gridWidth,
         * so we need to adjust to allow for extra columns
         * 
         * Our basic heuristic is to take the current gridWidth, plus 
         * numeric columns and call this the base gridwidth.
         * 
         * To that we add 100 for any '*' column, and x% of the base gridWidth
         * for any column that is a %
         *  
         * @param {Grid} grid the grid from which data should be exported
         * @param {object} exportHeaders array of header information 
         * @returns {object} an array of header widths
         */
        calculatePdfHeaderWidths: function ( grid, exportHeaders ) {
          var baseGridWidth = 0;
          angular.forEach(exportHeaders, function(value){
            if (typeof(value.width) === 'number'){
              baseGridWidth += value.width;
            }
          });
          
          var extraColumns = 0;
          angular.forEach(exportHeaders, function(value){
            if (value.width === '*'){
              extraColumns += 100;
            }
            if (typeof(value.width) === 'string' && value.width.match(/(\d)*%/)) {
              var percent = parseInt(value.width.match(/(\d)*%/)[0]);
              
              value.width = baseGridWidth * percent / 100;
              extraColumns += value.width;
            }
          });
          
          var gridWidth = baseGridWidth + extraColumns;
          
          return exportHeaders.map(function( header ) {
            return header.width === '*' ? header.width : header.width * grid.options.exporterPdfMaxGridWidth / gridWidth;
          });
          
        },
        
        /**
         * @ngdoc function
         * @name formatRowAsPdf
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a row in a format consumable by PDF,
         * mainly meaning casting everything to a string
         * @param {exporterService} exporter pass in exporter 
         * @param {array} row the row to be turned into a csv string
         * @returns {string} a csv-ified version of the row
         */
        formatRowAsPdf: function ( exporter ) {
          return function( row ) {
            return row.map(exporter.formatFieldAsPdfString);
          };
        },
        
        
        /**
         * @ngdoc function
         * @name formatFieldAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a pdf-able field, which
         * is different from a csv field only in that strings don't have quotes
         * around them
         * @param {field} field the field to be turned into a pdf string,
         * may be of any type
         * @returns {string} a string-ified version of the field
         */
        formatFieldAsPdfString: function (field) {
          if (field == null) { // we want to catch anything null-ish, hence just == not ===
            return '';
          }
          if (typeof(field) === 'number') {
            return field.toString();
          }
          if (typeof(field) === 'boolean') {
            return (field ? 'TRUE' : 'FALSE') ;
          }
          if (typeof(field) === 'string') {
            return field.replace(/"/g,'""');
          }

          return JSON.stringify(field).replace(/^"/,'').replace(/"$/,'');        
        }
      };

      return service;

    }
  ]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.exporter.directive:uiGridExporter
   *  @element div
   *  @restrict A
   *
   *  @description Adds exporter features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.exporter']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.gridOptions = {
        enableGridMenu: true,
        exporterMenuCsv: false,
        columnDefs: [
          {name: 'name', enableCellEdit: true},
          {name: 'title', enableCellEdit: true}
        ],
        data: $scope.data
      };
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="gridOptions" ui-grid-exporter></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridExporter', ['uiGridExporterConstants', 'uiGridExporterService', 'gridUtil', '$compile',
    function (uiGridExporterConstants, uiGridExporterService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          uiGridExporterService.initializeGrid(uiGridCtrl.grid);
          uiGridCtrl.grid.exporter.$scope = $scope;
        }
      };
    }
  ]);
})();
