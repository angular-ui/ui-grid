# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.10.3](https://github.com/angular-ui/ui-grid/compare/v4.10.2...v4.10.3) (2021-08-01)


### Bug Fixes

* 🐛 address linting issues and unit test failures ([a9cf59f](https://github.com/angular-ui/ui-grid/commit/a9cf59f6ff31f065332bdd20b0931dba0b982183))
* export filter with time part ('date:"MM-dd-YYYY HH:mm'). ([29d4803](https://github.com/angular-ui/ui-grid/commit/29d4803d702409bffafc30b33cbbdeda53992776))
* canvas now has a minimum height of 1px, which renders it even if it has no data ([07c26d5](https://github.com/angular-ui/ui-grid/commit/07c26d576fe6e012730fead14c9e9139d606ed13))
* adjustColumns now calculates the colIndex instead of guessing it scrollpercentage ([ed76f02](https://github.com/angular-ui/ui-grid/commit/ed76f02090f3510d555cacdae03f1edad849d27a))




## [4.10.2](https://github.com/angular-ui/ui-grid/compare/v4.10.1...v4.10.2) (2021-06-14)


### Bug Fixes

* 🐛 improve accessibility in the grid menus and selection ([e5ae7c0](https://github.com/angular-ui/ui-grid/commit/e5ae7c085f4ac314dfbd4fab15b24f20730ee5cd))
* **core:** use allowFloatWidth property to allow float calculations for width ([bb28b2f](https://github.com/angular-ui/ui-grid/commit/bb28b2fb523f5e47aa61a80bf70e4aabc49ab1e7))
* **core:** use allowFloatWidth property to allow float calculations for width ([f4d3e22](https://github.com/angular-ui/ui-grid/commit/f4d3e222965d91a7faf0f4886ad6d4906789df9e))





## [4.10.1](https://github.com/angular-ui/ui-grid/compare/v4.10.0...v4.10.1) (2021-05-28)


### Bug Fixes

* 🐛 ensure select all checkbox is announced correctly ([3b478fa](https://github.com/angular-ui/ui-grid/commit/3b478fa22fd6a438bc63331a36b4c0606d0edd36))
* 🐛 remove extra $applyAsync from header-cell ([f9a84ff](https://github.com/angular-ui/ui-grid/commit/f9a84ff8cb314e6823bda53f174157b318b238d7))





## [4.9.1](https://github.com/angular-ui/ui-grid/compare/v4.9.0...v4.9.1) (2020-10-26)


### Bug Fixes

* 🐛 update rtl support function to fix rtl support ([75580b8](https://github.com/angular-ui/ui-grid/commit/75580b88c46a36029b3abb3b57eaccf1928c22ad)), closes [#7126](https://github.com/angular-ui/ui-grid/issues/7126)





# [4.9.0](https://github.com/angular-ui/ui-grid/compare/v4.8.5...v4.9.0) (2020-09-27)


### Bug Fixes

* 🐛 replace missing string with empty string ([f7d48ee](https://github.com/angular-ui/ui-grid/commit/f7d48ee4e28f8a1233d0dc1bf4e10a5446df6e32)), closes [#7063](https://github.com/angular-ui/ui-grid/issues/7063)


### BREAKING CHANGES

* MISSING string will no longer be displayed.





## [4.8.5](https://github.com/angular-ui/ui-grid/compare/v4.8.3...v4.8.5) (2020-09-14)

**Note:** Add support for angular 1.8.0





## [4.8.4](https://github.com/angular-ui/ui-grid/compare/v4.8.3...v4.8.4) (2020-09-14)

**Note:** Version bump only for package @ui-grid/core





## [4.8.2](https://github.com/angular-ui/ui-grid/compare/v4.8.1...v4.8.2) (2019-10-07)


### Bug Fixes

* **core:** scrollToIfNecessary not properly including rowHeight on downward scrolls ([7a0e1dc](https://github.com/angular-ui/ui-grid/commit/7a0e1dc))
* **scrolling:** column footers misaligned with data [#6909](https://github.com/angular-ui/ui-grid/issues/6909) ([74f9107](https://github.com/angular-ui/ui-grid/commit/74f9107))





## [4.8.1](https://github.com/angular-ui/ui-grid/compare/v4.8.0...v4.8.1) (2019-06-27)


### Bug Fixes

* **core:** support jQlite ([78e44f9](https://github.com/angular-ui/ui-grid/commit/78e44f9))
* **ui-grid:** [#6937](https://github.com/angular-ui/ui-grid/issues/6937) fix linter error ([13bb9c0](https://github.com/angular-ui/ui-grid/commit/13bb9c0))
* **ui-grid:** [#6937](https://github.com/angular-ui/ui-grid/issues/6937) getScrollBarWidth for Firefox ([6aee591](https://github.com/angular-ui/ui-grid/commit/6aee591))





# [4.8.0](https://github.com/angular-ui/ui-grid/compare/v4.7.1...v4.8.0) (2019-05-02)


### Bug Fixes

* **less:** improve less compilation ([2ab139e](https://github.com/angular-ui/ui-grid/commit/2ab139e))


### Features

* **filterChanged:** pass the changed column as first argument to filterChanged function ([13eacc3](https://github.com/angular-ui/ui-grid/commit/13eacc3)), closes [#4775](https://github.com/angular-ui/ui-grid/issues/4775)





# [4.7.0](https://github.com/angular-ui/ui-grid/compare/v4.6.6...v4.7.0) (2019-02-01)


### Features

* **css:** add feature based CSS files ([9e1c042](https://github.com/angular-ui/ui-grid/commit/9e1c042))
