/* globals protractor, element, by, browser */
/**
 * @ngdoc overview
 * @name ui.grid.e2eTestLibrary
 * @description
 * End to end test functions.  Whenever these are updated, it may also be necessary
 * to update the associated tutorial.
 *
 */

/**
 * @ngdoc service
 * @name ui.grid.e2eTestLibrary.api:gridTest
 */
module.exports = {
  /**
  * Helper function that reloads the page between each test if the current browser is Firefox
  *
  * @example
  * <pre>
  *   gridTestUtils.firefoxReload();
  * </pre>
  */
  firefoxReload: function () {
    beforeEach(function () {
      return browser.getCapabilities().then(function (cap) {
        if (cap && cap.caps_ && cap.caps_.browserName === 'firefox') {
          return browser.refresh()
            .then(function () {
              // Remove the fixed navbar, it overlays elements and intercepts events in Firefox
              return browser.driver.executeScript(function () {
                angular.element(document.getElementsByClassName('navbar')).remove();
              });
            });
        } else {
          return browser.refresh();
        }
      });
    });
  },

  /**
  * Helper function that uses mouseMove/mouseDown/mouseUp for clicking.
  *
  * This is unfortunately needed because `.click()` doesn't work right in Firefox.
  *
  * @param element {WebElement}
  *
  * @returns {Promise} A promise that is resolved when the click has been performed.
  *
  * @example
  * <pre>
  *   gridTestUtils.click(element);
  * </pre>
  */
  click: function (element) {
    return browser.actions().mouseMove(element).mouseDown(element).mouseUp().perform();
  },

  /**
  * Helper function for returning a grid element.
  * @param gridId Id of grid to return.
  *
  * @returns {ElementFinder|Grid}  Grid wrapped in an ElementFinder
  *
  * @example
  * <pre>
  *   var grid = gridTestUtils.getGrid( 'myGrid' ); //or internally
  *   var row = this.getGrid( gridId );
  * </pre>
  */
  getGrid: function( gridId ) {
    return element( by.id( gridId ) );
  },

  /**
  * Helper function for returning a row.
  *
  * @param gridId {string}
  * @param rowNum {Integer}
  *
  * @returns {ElementFinder|*}
  *
  * @example
  * <pre>
  *   var row = gridTestUtils.getRow( 'myGrid', 0); //or internally
  *   var row = this.getRow( gridId, rowNum );
  * </pre>
  */
  getRow: function( gridId, rowNum ) {
    return this.getGrid( gridId ).element( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row( rowNum )  );
  },

  /**
  * Helper function to select a row.
  *
  * @param gridId {string}
  * @param rowNum {integer}
  *
  *
  * @example
  * <pre>
  *   var row = gridTestUtils.selectRow( 'myGrid', 0 );
  * </pre>
  */
  selectRow: function( gridId, rowNum ) {
    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    var row = this.getRow( gridId, rowNum );
    var btn = row.element( by.css('.ui-grid-selection-row-header-buttons') );
    return browser.actions().mouseMove(btn).mouseDown(btn).mouseUp().perform();
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectRowCount
  * @description Checks that a grid has the specified number of rows. Note
  * that this only returns the number of rendered rows, and the grid does
  * row virtualisation - that is that the browser can only see the rendered
  * rows, not all the rows in the dataset.  This method is useful when doing
  * functional tests with small numbers of data, but typically with numbers
  * greater than about 10 you'll find that some of the rows are not rendered
  * and therefore an error is given.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedNumRows the number of visible rows you expect the
  * grid to have
  *
  * @example
  * <pre>
  *   gridTestUtils.expectRowCount('myGrid', 2);
  * </pre>
  *
  */
  expectRowCount: function( gridId, expectedNumRows ) {

    var rows = this.getGrid( gridId ).element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).toEqual(expectedNumRows);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectHeaderColumnCount
  * @description Checks that a grid header body render container (the default render container)
  * has the specified number of columns.  If you are using pinned columns then you may also want
  * to check expectHeaderLeftColumnCount
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedNumCols the number of visible columns you expect the
  * body to have
  *
  * @example
  * <pre>
  *   gridTestUtils.expectHeaderColumnCount('myGrid', 2);
  * </pre>
  *
  */
  expectHeaderColumnCount: function( gridId, expectedNumCols ) {
    var headerCols = this.getGrid( gridId ).element( by.css('.ui-grid-render-container-body')).element( by.css('.ui-grid-header') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );
    expect(headerCols.count()).toEqual(expectedNumCols);
  },

  /**
   * @ngdoc method
   * @methodOf ui.grid.e2eTestLibrary.api:gridTest
   * @name expectHeaderColumns
   * @description Checks that a grid has the given column headers.
   * @param {string} gridId The ID of the grid that you want to inspect.
   * @param {array} expectedColumns The column headers you expect.
   *
   * @example
   * <pre>
   *   gridTestUtils.expectHeaderColumns('myGrid', ['ID', 'Name', 'Email']);
   * </pre>
   */
  expectHeaderColumns: function(gridId, expectedColumns) {
    var headerColumns = this.getGrid(gridId)
      .element(by.css('.ui-grid-render-container-body'))
      .element( by.css('.ui-grid-header'))
      .all(by.repeater('col in colContainer.renderedColumns track by col.uid'))
      .all(by.css('.ui-grid-header-cell-label'));

    expect(headerColumns.count()).toBe(expectedColumns.length);

    headerColumns.getText().then(function(columnTexts) {
      columnTexts = columnTexts.map(function trimText(text) {
        return text.replace(/^\s+/, '').replace(/\s+$/, '');
      });
      expect(columnTexts).toEqual(expectedColumns);
    });
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectHeaderLeftColumnCount
  * @description Checks that a grid header left render container has the specified number of columns.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedNumCols the number of visible columns you expect the
  * left render container to have
  *
  * @example
  * <pre>
  *   gridTestUtils.expectHeaderLeftColumnCount('myGrid', 2);
  * </pre>
  *
  */
  expectHeaderLeftColumnCount: function( gridId, expectedNumCols ) {
    var headerCols = this.getGrid( gridId ).element( by.css('.ui-grid-render-container-left')).element( by.css('.ui-grid-header') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );
    expect(headerCols.count()).toEqual(expectedNumCols);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectFooterColumnCount
  * @description Checks that a grid footer has the specified number of rows.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedNumCols the number of visible columns you expect the
  * grid to have
  *
  * @example
  * <pre>
  *   gridTestUtils.expectColumnCount('myGrid', 2);
  * </pre>
  *
  */
  expectFooterColumnCount: function( gridId, expectedNumCols ) {
    var footerCols = this.getGrid( gridId ).element( by.css('.ui-grid-footer') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );
    expect(footerCols.count()).toEqual(expectedNumCols);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name headerCell
  * @description Internal method used to return a headerCell element
  * given the grid and column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} col the number of the column (within the visible columns)
  * that you want to return
  *
  * @example
  * <pre>
  *   gridTestUtils.headerCell('myGrid', 2);
  * </pre>
  *
  */
  headerCell: function( gridId, expectedCol, expectedValue ) {
    return this.getGrid( gridId ).element( by.css('.ui-grid-render-container-body')).element( by.css('.ui-grid-header') ).element( by.repeater('col in colContainer.renderedColumns track by col.uid').row( expectedCol)  );
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name footerCell
  * @description Internal method used to return a footerCell element
  * given the grid and column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} col the number of the column (within the visible columns)
  * that you want to return
  *
  * @example
  * <pre>
  *   gridTestUtils.headerCell('myGrid', 2);
  * </pre>
  *
  */
  footerCell: function( gridId, expectedCol, expectedValue ) {
    return this.getGrid( gridId ).element( by.css('.ui-grid-footer') ).element( by.repeater('col in colContainer.renderedColumns track by col.uid').row( expectedCol)  );
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name dataCell
  * @description Internal method used to return a dataCell element
  * given the grid and column, note it only returns from the 'body'
  * render container
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} fetchRow the number of the row (within the visible rows)
  * that you want to return
  * @param {integer} fetchCol the number of the col (within the visible cols)
  * that you want to return
  *
  * @example
  * <pre>
  *   myElement = gridTestUtils.dataCell('myGrid', 2, 2);
  * </pre>
  *
  */
  dataCell: function( gridId, fetchRow, fetchCol ) {
    var row = this.getGrid( gridId ).element( by.css('.ui-grid-render-container-body')).element( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row( fetchRow )  );
    return row.element( by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row( fetchCol ));
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectHeaderCellValueMatch
  * @description Checks that a header cell matches the specified value,
  * takes a regEx or a simple string.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedCol the number of the column (within the visible columns)
  * that you want to check the value of
  * @param {string} expectedValue a regex or string of the value you expect in that header
  *
  * @example
  * <pre>
  *   gridTestUtils.expectHeaderCellValueMatch('myGrid', 2, 'HeaderValue');
  * </pre>
  *
  */
  expectHeaderCellValueMatch: function( gridId, expectedCol, expectedValue ) {
    var headerCell = this.headerCell( gridId, expectedCol);
    expect(headerCell.element(by.css('.ui-grid-header-cell-label')).getText()).toMatch(expectedValue);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectFooterCellValueMatch
  * @description Checks that a footer cell matches the specified value,
  * takes a regEx or a simple string.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedCol the number of the column (within the visible columns)
  * that you want to check the value of
  * @param {string} expectedValue a regex or string of the value you expect in that footer
  *
  * @example
  * <pre>
  *   gridTestUtils.expectFooterCellValueMatch('myGrid', 2, 'FooterValue');
  * </pre>
  *
  */
  expectFooterCellValueMatch: function( gridId, expectedCol, expectedValue ) {
    var footerCell = this.footerCell( gridId, expectedCol);
    expect(footerCell.getText()).toMatch(expectedValue);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectCellValueMatch
  * @description Checks that a cell matches the specified value,
  * takes a regEx or a simple string.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedRow the number of the row (within the visible rows)
  * that you want to check the value of
  * @param {integer} expectedCol the number of the column (within the visible columns)
  * that you want to check the value of
  * @param {string} expectedValue a regex or string of the value you expect in that cell
  *
  * @example
  * <pre>
  *   gridTestUtils.expectCellValueMatch('myGrid', 0, 2, 'CellValue');
  * </pre>
  *
  */
  expectCellValueMatch: function( gridId, expectedRow, expectedCol, expectedValue ) {
    var dataCell = this.dataCell( gridId, expectedRow, expectedCol );
    expect(dataCell.getText()).toMatch(expectedValue);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectRowValuesMatch
  * @description Checks that a row matches the specified values,
  * takes an array of regExes or simple strings.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} expectedRow the number of the row (within the visible rows)
  * that you want to check the value of
  * @param {array} expectedValueArray an array of regexes or strings of the values you expect in that row
  *
  * @example
  * <pre>
  *   gridTestUtils.expectRowValuesMatch('myGrid', 0, [ 'CellValue1', '^cellvalue2', 'cellValue3$' ]);
  * </pre>
  *
  */
  expectRowValuesMatch: function( gridId, expectedRow, expectedValueArray ) {
    var row = this.getRow( gridId, expectedRow );

    for ( var i = 0; i < expectedValueArray.length; i++) {
      expect(row.element( by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(i)).getText()).toMatch(expectedValueArray[i], 'Expected to match: ' + expectedValueArray[i] + ' in column: ' + i);
    }
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickHeaderCell
  * @description Clicks on the header of the specified column,
  * which would usually result in a sort
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to click on
  *
  * @example
  * <pre>
  *   gridTestUtils.clickHeaderCell('myGrid', 0);
  * </pre>
  *
  */
  clickHeaderCell: function( gridId, colNumber ) {
    var headerCell = this.headerCell( gridId, colNumber);

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    return browser.actions().mouseMove(headerCell).mouseDown(headerCell).mouseUp().perform();
    // return headerCell.click();
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name resizeHeaderCell
  * @description Drags the left resizer border towards the column menu button,
  * which will perform a column resizing.
  * @param {string} gridId the id of the grid that you want to adjust
  * @param {integer} colNumber the number of the column (within the visible columns)
  * which left resizer border you wish to drag (this will increase the size of colNumber-1).
  *
  * @example
  * <pre>
  *   gridTestUtils.resizeHeaderCell('myGrid', 1);
  * </pre>
  *
  */
  resizeHeaderCell: function( gridId, colNumber ) {
    var headerCell = this.headerCell(gridId, colNumber);

    var resizer = headerCell.all( by.css( '.ui-grid-column-resizer' )).first();
    var menuButton = headerCell.element( by.css( '.ui-grid-column-menu-button' ));

    return browser.actions()
      .mouseDown(resizer)
      .mouseMove(menuButton)
      .mouseUp()
      .perform();

  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name shiftClickHeaderCell
  * @description Shift-clicks on the header of the specified column,
  * which would usually result in adding a second column to the sort
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to click on
  *
  * @example
  * <pre>
  *   gridTestUtils.shiftClickHeaderCell('myGrid', 0);
  * </pre>
  *
  */
  shiftClickHeaderCell: function( gridId, colNumber ) {
    var headerCell = this.headerCell( gridId, colNumber);

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    return browser.actions()
      .keyDown(protractor.Key.SHIFT)
      .mouseMove(headerCell)
      .mouseDown(headerCell)
      .mouseUp()
      .keyUp(protractor.Key.SHIFT)
      .perform();
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickColumnMenu
  * @description  Clicks the specified column then the specified option in the
  * menu.  Using this method is fragile, as any change to menu ordering
  * will break all the tests.  For this reason it is recommended to wrap
  * this into "clickColumnMenu<ItemName>" methods, each with a constant
  * for the item you want to click on.  You could alternatively develop
  * a method that finds a menu item by text value, but given that
  * ui-grid has i18n, the text values could also change easily
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want click on
  * @param {integer=} menuItemNumber the number of the item in the menu that
  * you want to click on. If not provided will just open the menu.
  *
  * @example
  * <pre>
  *   gridTestUtils.clickColumnMenu('myGrid', 0, 0);
  * </pre>
  *
  */
  clickColumnMenu: function( gridId, colNumber, menuItemNumber ) {
    var self = this;

    var headerCell = this.headerCell( gridId, colNumber);

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    var menuButton = headerCell.element( by.css( '.ui-grid-column-menu-button' ) );

    return browser.actions().mouseMove(menuButton).mouseDown(menuButton).mouseUp().perform()
      .then(function () {
        if (typeof menuItemNumber !== 'undefined') {
          var columnMenu = self.getGrid( gridId ).element( by.css( '.ui-grid-column-menu' ));
          var row = columnMenu.element( by.repeater('item in menuItems').row(menuItemNumber) );

          return browser.actions().mouseMove(row).mouseDown(row).mouseUp().perform();
        } else {
          return true;
        }
      });
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickColumnMenuSortAsc
  * @description Clicks on the sort ascending item within the specified
  * column menu.  Although it feels cumbersome to write lots of individual
  * "click this menu item" helpers, it is quite useful if the column menus are
  * changed to not have to go to every test script and change the menu item number
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to sort on
  *
  * @example
  * <pre>
  *   gridTestUtils.clickColumnMenuSortAsc('myGrid', 0);
  * </pre>
  *
  */
  clickColumnMenuSortAsc: function( gridId, colNumber ) {
    return this.clickColumnMenu( gridId, colNumber, 0);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickColumnMenuSortDesc
  * @description Clicks on the sort descending item within the specified
  * column menu.  Although it feels cumbersome to write lots of individual
  * "click this menu item" helpers, it is quite useful if the column menus are
  * changed to not have to go to every test script and change the menu item number
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to sort on
  *
  * @example
  * <pre>
  *   gridTestUtils.clickColumnMenuSortDesc('myGrid', 0);
  * </pre>
  *
  */
  clickColumnMenuSortDesc: function( gridId, colNumber ) {
    return this.clickColumnMenu( gridId, colNumber, 1);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickColumnMenuRemoveSort
  * @description Clicks on the remove sort item within the specified
  * column menu.  Although it feels cumbersome to write lots of individual
  * "click this menu item" helpers, it is quite useful if the column menus are
  * changed to not have to go to every test script and change the menu item number
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to remove the sort from
  *
  * @example
  * <pre>
  *   gridTestUtils.clickColumnMenuRemoveSort('myGrid', 0);
  * </pre>
  *
  */
  clickColumnMenuRemoveSort: function( gridId, colNumber ) {
    return this.clickColumnMenu( gridId, colNumber, 2);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickColumnMenuHide
  * @description Clicks on the hide item within the specified
  * column menu.  Although it feels cumbersome to write lots of individual
  * "click this menu item" helpers, it is quite useful if the column menus are
  * changed to not have to go to every test script and change the menu item number
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to hide
  *
  * @example
  * <pre>
  *   gridTestUtils.clickColumnMenuHide('myGrid', 0);
  * </pre>
  *
  */
  clickColumnMenuHide: function( gridId, colNumber ) {
    return this.clickColumnMenu( gridId, colNumber, 3);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectFilterBoxInColumn
  * @description Checks that a filter box exists in the specified column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to verify the filter box is in
  * @param {integer} count the number filter boxes you expect - 0 meaning none, 1 meaning
  * a standard filter, 2 meaning a numerical filter with greater than / less than.
  *
  * @example
  * <pre>
  *   gridTestUtils.expectFilterBoxInColumn('myGrid', 0, 0);
  * </pre>
  *
  */
  expectFilterBoxInColumn: function( gridId, colNumber, count ) {
    var headerCell = this.headerCell( gridId, colNumber);

    expect( headerCell.all( by.css( '.ui-grid-filter-input' ) ).count() ).toEqual(count);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectFilterSelectInColumn
  * @description Checks that a filter select dropdown exists in the specified column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to verify the filter select is in
  * @param {integer} count the number filter selects you expect - 0 meaning none, 1 meaning
  * a standard filter, 2 meaning a numerical filter with greater than / less than.
  *
  * @example
  * <pre>
  *   gridTestUtils.expectFilterSelectInColumn('myGrid', 0, 0);
  * </pre>
  *
  */
  expectFilterSelectInColumn: function( gridId, colNumber, count ) {
    var headerCell = this.headerCell( gridId, colNumber);

    expect( headerCell.all( by.css( '.ui-grid-filter-select' ) ).count() ).toEqual(count);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name cancelFilterInColumn
  * @description Cancels the filter in a column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to cancel the filter in
  *
  * @example
  * <pre>
  *   gridTestUtils.cancelFilterInColumn('myGrid', 0);
  * </pre>
  *
  */
  cancelFilterInColumn: function( gridId, colNumber ) {
    var headerCell = this.headerCell( gridId, colNumber);

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    var cancelButton = headerCell.element( by.css( '.ui-grid-icon-cancel' ) );

    return browser.actions().mouseMove(cancelButton).mouseDown(cancelButton).mouseUp().perform();
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name enterFilterInColumn
  * @description Enters a filter in a column
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to enter the filter in
  * @param {string} filterValue the value you want to enter into the filter
  *
  * @example
  * <pre>
  *   gridTestUtils.cancelFilterInColumn('myGrid', 0);
  * </pre>
  *
  */
  enterFilterInColumn: function( gridId, colNumber, filterValue ) {
    var headerCell = this.headerCell( gridId, colNumber);

    return headerCell.element( by.css( '.ui-grid-filter-input' ) ).sendKeys(filterValue);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectVisibleColumnMenuItems
  * @description Checks how many visible menu items there are in the column menu
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} colNumber the number of the column (within the visible columns)
  * that you want to check the count for
  * @param {integer} expectItems the number of visible items you expect
  *
  * @example
  * <pre>
  *   gridTestUtils.visibleColumnMenuItems('myGrid', 0, 3);
  * </pre>
  *
  */
  expectVisibleColumnMenuItems: function( gridId, colNumber, expectItems ) {
    var self = this;

    var headerCell = self.headerCell( gridId, colNumber );

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    var colMenuButton = headerCell.element( by.css( '.ui-grid-column-menu-button' ) );

    return browser.actions().mouseMove(colMenuButton).mouseDown(colMenuButton).mouseUp().perform()
      .then(function () {
        var displayedCount = 0;
        var columnMenu = self.getGrid( gridId ).element( by.css( '.ui-grid-column-menu' ));

        var menuItems = columnMenu.all( by.css( '.ui-grid-menu-item' ) );

        return menuItems.map(function(elm) {
          return elm.isDisplayed();
        }).then( function( displayedArray ) {
          for ( var i = 0; i < displayedArray.length; i++ ) {
            if ( displayedArray[i] ) {
              displayedCount++;
            }
          }
          return expect(displayedCount).toEqual( expectItems );
        });
      });
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name expectVisibleGridMenuItems
  * @description Checks how many visible menu items there are in the grid menu
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {Integer} expectItems the number of visible items you expect
  *
  * @example
  * <pre>
  *   gridTestUtils.expectVisibleGridMenuItems('myGrid', 3);
  * </pre>
  */
  expectVisibleGridMenuItems: function( gridId, expectItems ) {
    var gridMenuButton = this.getGrid( gridId ).element( by.css ( '.ui-grid-menu-button' ) );

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    browser.actions().mouseMove(gridMenuButton).mouseDown(gridMenuButton).mouseUp().perform();

    var displayedCount = 0;

    var menuItems = gridMenuButton.all( by.css( '.ui-grid-menu-item' ) );

    menuItems.map(function(elm) {
      return elm.isDisplayed();
    }).then( function( displayedArray ) {
      for ( var i = 0; i < displayedArray.length; i++ ) {
        if ( displayedArray[i] ) {
          displayedCount++;
        }
      }
      expect(displayedCount).toEqual( expectItems );
    });
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name clickGridMenuItem
  * @description Clicks on a numbered grid menu item.  Note that it's clicking
  * the item based on the underlying repeater - and that some of the items will
  * not be visible.  So the item you want to click on may not be the same
  * as the item number when you look at the ui
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {Integer} itemNumber the number of visible items you expect
  *
  * @example
  * <pre>
  *   gridTestUtils.clickGridMenuItem('myGrid', 9);
  * </pre>
  *
  */
  clickGridMenuItem: function( gridId, itemNumber ) {
    var gridMenuButton = this.getGrid( gridId ).element( by.css ( '.ui-grid-menu-button' ) );

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    return browser.actions().mouseMove(gridMenuButton).mouseDown(gridMenuButton).mouseUp().perform()
      .then(function () {
        var row;

        browser.sleep(500);

        row = element(by.id('menuitem-' + itemNumber)).element(by.css('.ui-grid-menu-item'));

        return browser.actions().mouseMove(row).mouseDown(row).mouseUp().perform();
      });
  },

  /**
   * @ngdoc method
   * @methodOf ui.grid.e2eTestLibrary.api:gridTest
   * @name getInnerHtml
   * @description Gets the inner HTML content of a target element
   * @param {Object} target The element whose inner HTML you want
   *
   * @example
   * <pre>
   *   gridTestUtils.getInnerHtml(element(by.id('myGrid'));
   * </pre>
   */
  getInnerHtml: function(target) {
    return browser.executeScript('return arguments[0].innerHTML;', target);
  },

  /**
  * @ngdoc method
  * @methodOf ui.grid.e2eTestLibrary.api:gridTest
  * @name unclickGridMenu
  * @description Closes the grid menu if it's open (opens it if it's closed).
  * The grid menu stays open when you change column visibility, it sometimes needs
  * to be closed again.
  * @param {string} gridId the id of the grid that you want to inspect
  *
  * @example
  * <pre>
  *   gridTestUtils.unclickGridMenu('myGrid');
  * </pre>
  *
  */
  unclickGridMenu: function( gridId ) {
    var gridMenuButton = this.getGrid( gridId ).element( by.css ( '.ui-grid-menu-button' ) );

    // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
    return browser.actions().mouseMove(gridMenuButton).mouseDown(gridMenuButton).mouseUp().perform();
  }
};
