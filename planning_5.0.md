# Planning UI-Grid Release 5.0 (Angular 5.0)

This document is intended to be a staged plan on stabilizing ui-grid and moving to the latest version of angular.

## Phase 1 - Stabilization

Before moving to the new version of Angular, it is in our best interest to update the test coverage on UI-Grid to be a through as possible, that way, we can be certain that the upgrade is not going to introduce any regressions. As such, the following tasks should be done prior to starting the move to the latest version of Angular, in order to ensure a smooth transition:

- [ ] Improve the unit test coverage of all files to at least 90%
- [ ] Get protractor tests to run and pass consistently without skipping tests
- [ ] Add protractor tests to the travis build process

## Phase 2 - Minor Improvements

Not all of the tasks here are absolutely necessary for the update, but they should help with a smoother transition to the new version and provide an improved experience for consumers of the grid.

- [ ] Update dev dependencies to the latest versions (MUST)
- [x] Merge/decline all outstanding Pull Requests (MUST)
- [ ] Clean up issues board of all non-issues, i.e. questions or issues for older versions that are no longer reproducible
- [ ] Update UI-Grid build system to publish multiple files separated by features, i.e. issue #5802 (MUST)
- [ ] Update UI-Grid styles to modernize it a bit, i.e. issue #3210

## Phase 3 - Angular Upgrade
Note: For this, we will do our best to follow the instructions laid out by the angular team in the following document: https://angular.io/guide/upgrade

- [ ] Convert core UI-Grid component to Angular 5
- [ ] Convert _stable features*_ of UI-Grid to Angular 5
- [ ] Convert all other features
- [ ] Find a replacement for ng-docs that works with Angular 5 (potentially create an upgraded version ourselves).

* stable features means feature that have both unit tests and running protractor test as well as features that have been tried and tested
