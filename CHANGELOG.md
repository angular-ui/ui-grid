<a name="v3.0.6"></a>
### v3.0.6 (2015-09-07)


#### Bug Fixes

* **gridUtil:** Fixes gridUtil.off.mousewheel event handler ([4057c64d](http://github.com/angular-ui/ng-grid/commit/4057c64d89d8c762b156961d565b65f9d9340749))
* **infiniteScroll:** Fixes infinitescroll scrolling
* **moveColumns:** Restore column order after altering columnDefs array. ([2d433bb](http://github.com/angular-ui/ng-grid/commit/2d433bb40ff089223dd019f35543a65d3d801a84))
* **pinnedColums:** Included pinned columns in export of visibile data. ([0b37bc4](http://github.com/angular-ui/ng-grid/commit/0b37bc403d3326514485e2c5a1a2bbed2a84ca65)), closes ([#3888](http://github.com/angular-ui/ng-grid/issues/3888))

<a name="v3.0.5"></a>
### v3.0.5 (2015-08-25)


#### Bug Fixes

* **cellNav:** Error when field defined with number ([5b74559f](http://github.com/angular-ui/ng-grid/commit/5b74559f3f2a34cbe3e4b1eca7c6e8df35b2d392), closes [#4258](http://github.com/angular-ui/ng-grid/issues/4258))
* **columns:** don't reset resized columns on data reset by default ([bda48aab](http://github.com/angular-ui/ng-grid/commit/bda48aabeb7898d63d5e05244fe88b37ba552899), closes [#4005](http://github.com/angular-ui/ng-grid/issues/4005))
* **core:**
  * fix #4180 by adding validity check for minWidth and maxWidth ([5b03cb2d](http://github.com/angular-ui/ng-grid/commit/5b03cb2da798c298eb78d2e2dfdf55bbb3d4bc51))
  * IE does not render correctly when binding is used in style. use ng-style instead ([9aea44ac](http://github.com/angular-ui/ng-grid/commit/9aea44ac78c3f27b1fbc2c0b70760511c5b37030))
* **customizer:** Fixes less customizer in docs ([f739d9fd](http://github.com/angular-ui/ng-grid/commit/f739d9fd88abef67172496b8dab4c257ed8a7b09), closes [#4079](http://github.com/angular-ui/ng-grid/issues/4079), [#3918](http://github.com/angular-ui/ng-grid/issues/3918))
* **edit:** fixes #4129 by only adding edit listener events when needed because of 'track by ([e6bc3009](http://github.com/angular-ui/ng-grid/commit/e6bc3009612570a4197aa50d8a908c6e99e8fe35))
* **expandable:** fix #4156 by calling stopProp on subgrid scroll ([a7dd337a](http://github.com/angular-ui/ng-grid/commit/a7dd337a7225941aeb203628d249bb7b173a5471))
* **less:** Makes less bootstrap dir a variable ([654c75f9](http://github.com/angular-ui/ng-grid/commit/654c75f9a9ded0a1d1e70a1e23668cd7fc4da03f), closes [#3368](http://github.com/angular-ui/ng-grid/issues/3368))
* **pagination:** avoid initial double firing of `paginationChanged` ([1407038b](http://github.com/angular-ui/ng-grid/commit/1407038b206a8cdc4590d84d079ed22b3d087853))


#### Features

* **core:**
  * Adds GridRowColumn to core ([2bed5307](http://github.com/angular-ui/ng-grid/commit/2bed5307c11e3882860c73f6d5f7e9a14d8adf74))
  * Add Clear all filters to grid menu ([77ffba5a](http://github.com/angular-ui/ng-grid/commit/77ffba5abf7b9efbbf63f37f13e2b94b9b8a483d))
* **i18n:** Completes zh-cn translation. ([0ad28408](http://github.com/angular-ui/ng-grid/commit/0ad28408c60ef7187f4a4e61efda9e0c62d79452))

<a name="v3.0.4"></a>
### v3.0.4 (2015-08-13)


#### Bug Fixes

* **grouping:** Grouping now raises a sort changed event ([d30b1ad3](http://github.com/angular-ui/ng-grid/commit/d30b1ad343ace939bf165bad2b061638a1404692), closes [#4155](http://github.com/angular-ui/ng-grid/issues/4155))

<a name="v3.0.3"></a>
### v3.0.3 (2015-08-10)


#### Bug Fixes

* **build:** Fixes Grunt Task not Publishing ([7571028d](http://github.com/angular-ui/ng-grid/commit/7571028d70069fed63bee65aadd606b5caf41ac6))

<a name="v3.0.2"></a>
### v3.0.2 (2015-08-10)


#### Bug Fixes

* flushDirtyRows will not throw an error when no dirty rows ([d46d04ca](http://github.com/angular-ui/ng-grid/commit/d46d04ca3574630ae09eae687e4cf4ea620c4321))
* **Build:**
  * Allow Angular 1.3.x upper constraint ([13d93f4e](http://github.com/angular-ui/ng-grid/commit/13d93f4e10f1f5e0fd7409eb258692876ed0f1b7), closes [#4064](http://github.com/angular-ui/ng-grid/issues/4064))
  * Handle -stable suffix for stable files ([f6c881e9](http://github.com/angular-ui/ng-grid/commit/f6c881e91d3eb26a8ed26d42189790b37b32f82f))
* **Grid:** Allow >45k row identities ([d533200f](http://github.com/angular-ui/ng-grid/commit/d533200f7e3702e61115e2e507f4201f9ba08319))
* **cellNav:** cellNav not getting attached to left container if it is built after body is rend ([36f386f4](http://github.com/angular-ui/ng-grid/commit/36f386f48419b378b93bd11da2914fb7c9649e35))
* **core:**
  * consider enableFiltering in autoAdjustHeight ([43974c48](http://github.com/angular-ui/ng-grid/commit/43974c48784bc5a2b61e6050489160c82131537c))
  * fix template issue in angular 1.2 ([d9c50cf3](http://github.com/angular-ui/ng-grid/commit/d9c50cf39b9b03c06bddf8515f07cbb9d9f60470))
* **edit:**
  * fix for Chrome and numeric inputs ([7d8af94c](http://github.com/angular-ui/ng-grid/commit/7d8af94c41baa0c7f81dce9fe7786dab814e9b8c))
  * selecting text no longer required on editor After implementing viewPortKeyPress, ([d609a108](http://github.com/angular-ui/ng-grid/commit/d609a108402293f49220d1523a9089ddd390aa78))
  * add/remove mousedown events in cellNav on beginEdit/endEdit A recent change by A ([708231f9](http://github.com/angular-ui/ng-grid/commit/708231f9f6e1f12f0f0f7d15eb8415dd0a7b7f11))


#### Features

* **cellNav:** Accessibility Support to Cell Nav ([9532de2b](http://github.com/angular-ui/ng-grid/commit/9532de2bdb083a0bb40a6099924e98893ab354e7), closes [#3896](http://github.com/angular-ui/ng-grid/issues/3896))
* **core:**
  * Two new directives to one bind ([a9d2f903](http://github.com/angular-ui/ng-grid/commit/a9d2f903848786fa09122354cfd00e11abbdb627))
  * grid menus accessible ([1d577b15](http://github.com/angular-ui/ng-grid/commit/1d577b1514c26fc005a47506a600b38d8d271a9a))
  * Accessibility and keyboard support to the grid header. ([1f1de5a4](http://github.com/angular-ui/ng-grid/commit/1f1de5a40ddf12311d719a7b58c1bbcd4b999612))
  * Accessibility and keyboard support to the filter controls. ([11a1ae55](http://github.com/angular-ui/ng-grid/commit/11a1ae55d4e4b6dab58f192eec9e6ddd34730446))
  * Basic screen reader accessibility functionality ([377485a4](http://github.com/angular-ui/ng-grid/commit/377485a47dcb32868f155c880108e3f07ec74820))
* **edit:** raise beginCellEdit in timeout allows complex editors time to render so they can ([6b5807fe](http://github.com/angular-ui/ng-grid/commit/6b5807fe5ddd0bba9a4b7535d5109923a1981388))
* **gridUtil:** Focus helper functions ([94e50a53](http://github.com/angular-ui/ng-grid/commit/94e50a532f7cef928385a5922169a88309c013b6))
* **i18n:**
  * Create ta.js ([40c58651](http://github.com/angular-ui/ng-grid/commit/40c58651baa3a008149bf79abd55875d8a7ae823))
  * accessibility i18n terms to 'en' ([e5c82998](http://github.com/angular-ui/ng-grid/commit/e5c8299839000ebba88fa43011f3778918c51b0b))
* **pagination:** Accessibiliy & Keyboard Support to Pagination Controls ([ee04132a](http://github.com/angular-ui/ng-grid/commit/ee04132a9857d64919c860c329fe09e27d9091fa))

<a name="v3.0.0"></a>
## v3.0.0 (2015-07-17)


#### Bug Fixes

* **Grid:** Force scroll to 100% when necessary ([3bcbe72d](http://github.com/angular-ui/ng-grid/commit/3bcbe72de0f296eedbeeca28f09600c0721824ba), closes [#3772](http://github.com/angular-ui/ng-grid/issues/3772))
* **Tests:** All e2e tests working in Firefox ([b9cc39f1](http://github.com/angular-ui/ng-grid/commit/b9cc39f1e067a318a38d1390ed4d20695a6a282e))
* **core:**
  * change scrollbar-placeholder background-color to transparent ([18a487ea](http://github.com/angular-ui/ng-grid/commit/18a487ea3b009beb9b584f446d8f0dfabe64304d))
  * add a horizontal scrollbar placeholder when needed ([365f21f0](http://github.com/angular-ui/ng-grid/commit/365f21f0bb8383c2103af0dea6e3a03986db0c04))
  * fix #3666 #3531 #3340 thanks to @500tech-user and @Jacquelin for PR's that led t ([e582174a](http://github.com/angular-ui/ng-grid/commit/e582174a826bb232ddbb4fda8001b64c3273df0d))
* **edit:** fix lost focus and cell scrolling into view on edit ([e9a6d4eb](http://github.com/angular-ui/ng-grid/commit/e9a6d4eba67dba23c42b54b23054c048cf9d8ebc))
* **grouping:** grouping a pinned column was broken ([acb7e7b6](http://github.com/angular-ui/ng-grid/commit/acb7e7b636aa9215b2463a2d4282261e95ef87f0))
* **i18n:** Replace ZWNJ with \u200c in Persian ([2f2936ae](http://github.com/angular-ui/ng-grid/commit/2f2936ae48df6fd9392f9f2ce9dc8369ac9c8261), closes [#3842](http://github.com/angular-ui/ng-grid/issues/3842))

<a name="v3.0.0-rc.22"></a>
### v3.0.0-rc.22 (2015-06-15)


#### Bug Fixes

* **Edit:** Allow COL_FIELD in editable templates ([fa9066b2](http://github.com/angular-ui/ng-grid/commit/fa9066b263f3ae27c085c85db07561e90fad10bd))
* **Selection:** Prevent IE from selecting text ([a1bbc0c5](http://github.com/angular-ui/ng-grid/commit/a1bbc0c57148076ddf5b988acc9abb748cbca1e6), closes [#3392](http://github.com/angular-ui/ng-grid/issues/3392))
* **cellNav:**
  * #3528  handle focus into grid from other controls ([92477c7a](http://github.com/angular-ui/ng-grid/commit/92477c7ad97f439582039b574baa2286f724d0ef))
  * IE was scrolling the viewPort to the end when the focuser div received focus.  S ([aa563554](http://github.com/angular-ui/ng-grid/commit/aa56355469e0c2fe825f6c063bb2e2f7937817c7))
  * focuser element should not have width or height or else the window will scroll t ([6997d2b7](http://github.com/angular-ui/ng-grid/commit/6997d2b7365e5fad79f0568d5f6a41d3600d69c0))
  * was processing left and right renderContainers where there is no need fix(edit): ([6f5d503d](http://github.com/angular-ui/ng-grid/commit/6f5d503d48c5871a4fd04918a6a6269758ef9bf7))
  *  add an empty element to focus on instead of focusing on the viewport ([6937d4d5](http://github.com/angular-ui/ng-grid/commit/6937d4d56d722e8e23c6c0b19e917f8bdc3d8be6))
* **edit:**
  * #3128 remove grid scrollbars when in deepedit to prevent any scrolling of parent ([91077e82](http://github.com/angular-ui/ng-grid/commit/91077e828f450bbb7cb0c76404686110f700e396))
  * deep edit keydown logic wasn't right ([9e995e9e](http://github.com/angular-ui/ng-grid/commit/9e995e9e58582a6c190657c62ddf47632dc38045))
  * tweak the deep edit keydown logic so that Enter and Tab stops editing ([fbc38cb1](http://github.com/angular-ui/ng-grid/commit/fbc38cb17e314ceb48c887b03a9256199f101fe6))
  * #3742 dropdown was not calling out to cellNav for cellNav keys. also refactored  ([2edc4d66](http://github.com/angular-ui/ng-grid/commit/2edc4d66193b37734733b2a8a1999921426424b2))
  * Edit events were being attached in gridCell directive even if edit was not enabl ([13ab0945](http://github.com/angular-ui/ng-grid/commit/13ab0945a17597c9a7048fdb95936662a0cfdd82))
* **gridEdit:**
  * #3373 spacebar on checkbox was incorrectly invoking deep edit mode ([4d9ec8b5](http://github.com/angular-ui/ng-grid/commit/4d9ec8b5774b6beeaab05909a7a493aa6f16e72c))
  * issue 2885 non-character fields were invoking edit.  Not sure if I got all the k ([025c8939](http://github.com/angular-ui/ng-grid/commit/025c89397184ba44d65b7ad457546538e0cb3f22))
* **gridUtil:** rtlScrollType using wrong method ([15ee480e](http://github.com/angular-ui/ng-grid/commit/15ee480ef1ad34f1bd99de1f3ddfaa9730998c07), closes [#3637](http://github.com/angular-ui/ng-grid/issues/3637))
* **moveColumn:** account for width of left container when positioning moving column header. ([06f223bb](http://github.com/angular-ui/ng-grid/commit/06f223bbeb8cf8a82dd70142ab8d46f051df12be), closes [#3417](http://github.com/angular-ui/ng-grid/issues/3417), [#3395](http://github.com/angular-ui/ng-grid/issues/3395))
* **saveState:** Saving state was storing rowHeader columns, causing issues on restore. ([c9ce96af](http://github.com/angular-ui/ng-grid/commit/c9ce96af75ffde134dba3b8c319b301f41781c33))
* **treeBase:** Change calculation of number of levels in tree ([26ca6215](http://github.com/angular-ui/ng-grid/commit/26ca621594252f2e8b87687b2667b3e8d2e36226))
* **uiGrid:**
  * Add relatively-positioned wrapper ([9b2c6d51](http://github.com/angular-ui/ng-grid/commit/9b2c6d515968d0502a5a7fa1b6b6f15693669715), closes [#3412](http://github.com/angular-ui/ng-grid/issues/3412))
  * Use track by uid on columns ([e9ea9d47](http://github.com/angular-ui/ng-grid/commit/e9ea9d470823506b76458b9071cd16c3d08fb9e6))
* **uiGridColumns:** Fix auto-incrementing of column names ([a10f1414](http://github.com/angular-ui/ng-grid/commit/a10f141444043589ecc87a79f74938d1640cdc40))
* **uiGridHeader:**
  * ensure that styles are rebuilt on explicit height ([65ad61f4](http://github.com/angular-ui/ng-grid/commit/65ad61f4439983179be4d44bac3a6cc9151ac094))
  * Recalc all explicit heights ([43f63ac9](http://github.com/angular-ui/ng-grid/commit/43f63ac9f62a133b51d7af2f4a966318eae8e9ac), closes [#3136](http://github.com/angular-ui/ng-grid/issues/3136))


#### Features

* **grouping:** Add option groupingNullLabel, to group null and undefined values together. ([9fbb1b87](http://github.com/angular-ui/ng-grid/commit/9fbb1b874ecd773649bb27f9eea145b017614e51), closes [#3271](http://github.com/angular-ui/ng-grid/issues/3271))

<a name="v3.0.0-rc.21"></a>
### v3.0.0-rc.21 (2015-04-28)


#### Bug Fixes

* **Expandable:** Run with lower priority than ngIf ([949013c3](http://github.com/angular-ui/ng-grid/commit/949013c332c5af1b3e37b1d3fa515dfd96c8acb2), closes [#2804](http://github.com/angular-ui/ng-grid/issues/2804))
* **RTL:**
  * Use Math.abs for normalizing negatives ([4acbdc1a](http://github.com/angular-ui/ng-grid/commit/4acbdc1a58d8043d60e3a62d1126b0f69bc6ee86))
  * Use feature detection to determine RTL ([fbb36319](http://github.com/angular-ui/ng-grid/commit/fbb363197ab3975411589dfa0904495f861795c0), closes [#1689](http://github.com/angular-ui/ng-grid/issues/1689))
* **cellNav:** fix null ref issue in  navigate event for oldRowColumn  scrollTo should not setF ([02b05cae](http://github.com/angular-ui/ng-grid/commit/02b05cae6d5385e01d00f812662f16009130c647))
* **pinning:** restore correct width state ([4ffaaf26](http://github.com/angular-ui/ng-grid/commit/4ffaaf26774bae7f52bf4956f45243f6c7dd53a3))
* **scrolling:** Fix for #3260  atTop/Bottom/Left/Right needed tweaking ([89461bcb](http://github.com/angular-ui/ng-grid/commit/89461bcbcfdfc527655c398df19555738fa9bd63))
* **selection:**
  * allow rowSelection to be navigable if using cellNav; allow rowSelection via the  ([95ce7b1b](http://github.com/angular-ui/ng-grid/commit/95ce7b1b694b23f1a7506cf4f6a32d0ae384697c))
  * allow rowSelection to be navigable if using cellNav; allow rowSelection via the  ([3d5d6031](http://github.com/angular-ui/ng-grid/commit/3d5d603178f0fcb4cc2abab6ce637c1dd6face8d))
* **uiGrid:**
  * Use margins rather than floats for pinning ([1373b99e](http://github.com/angular-ui/ng-grid/commit/1373b99e1e1680184270d61bca88124efd7a4c14), closes [#2997](http://github.com/angular-ui/ng-grid/issues/2997), [#NaN](http://github.com/angular-ui/ng-grid/issues/NaN))
  * Wait for grid to get dimensions ([e7dfb8c2](http://github.com/angular-ui/ng-grid/commit/e7dfb8c2dfac69bb3a38f7253062367671fec56d))
* **uiGridColumnMenu:** Position relatively ([9d918052](http://github.com/angular-ui/ng-grid/commit/9d9180520d8d6fd16b897ba4b9fbfc4bb4860ea9), closes [#2319](http://github.com/angular-ui/ng-grid/issues/2319))
* **uiGridFooter:** Watch for col change ([1f9100de](http://github.com/angular-ui/ng-grid/commit/1f9100defb1489bed46515fb859aed9c9a090e73), closes [#2686](http://github.com/angular-ui/ng-grid/issues/2686))
* **uiGridHeader:**
  * Use parseInt on header heights ([98ed0104](http://github.com/angular-ui/ng-grid/commit/98ed01049015b22caddb651b1884f6e383fc58aa))
  * Allow header to shrink in size ([7c5cdca1](http://github.com/angular-ui/ng-grid/commit/7c5cdca1f471a0a3c1ef340fe65af268df68cae3), closes [#3138](http://github.com/angular-ui/ng-grid/issues/3138))


#### Features

* **saveState:** add pinning to save state ([b0d943a8](http://github.com/angular-ui/ng-grid/commit/b0d943a82a1d5c64808b759c8b96833e66380b02))


#### Breaking Changes

* gridUtil will no longer calculate dimensions of hidden
elements
 ([e7dfb8c2](http://github.com/angular-ui/ng-grid/commit/e7dfb8c2dfac69bb3a38f7253062367671fec56d))
*  Two events are now emitted on scroll:

 grid.api.core.ScrollBegin
 grid.api.core.ScrollEnd

 Before:
 grid.api.core.ScrollEvent
 After:
grid.api.core.ScrollBegin

ScrollToIfNecessary and ScrollTo moved from cellNav to core and grid removed from arguments
Before:
grid.api.cellNav.ScrollToIfNecessary(grid, gridRow, gridCol)
grid.api.cellNav.ScrollTo(grid, rowEntity, colDef)

After:
grid.api.core.ScrollToIfNecessary(gridRow, gridCol)
grid.api.core.ScrollTo(rowEntity, colDef)

GridEdit/cellNav
When using cellNav, a cell no longer receives focus.  Instead the viewport always receives focus.  This eliminated many bugs associated with scrolling and focus.

If you have a custom editor, you will no longer receive keyDown/Up events from the readonly cell.  Use the cellNav api viewPortKeyDown to capture any needed keydown events.  see GridEdit.js for an example
 ([052c2321](http://github.com/angular-ui/ng-grid/commit/052c2321f97b37f860c769dcbd2e8d9094cf2bbf))

<a name="v3.0.0-rc.20"></a>
### v3.0.0-rc.20 (2015-02-24)


#### Bug Fixes

* **Edit:** Wrong arguments on scrollToIfNecessary ([0fc6b21c](http://github.com/angular-ui/ng-grid/commit/0fc6b21ceff002226697e5d3520b6d4f8374b678))
* **Filtering:** Redraw grid properly when scrolled ([4c32e3d7](http://github.com/angular-ui/ng-grid/commit/4c32e3d77a1dce55a9354ad4e9d8f59b9fe2732f), closes [#2557](http://github.com/angular-ui/ng-grid/issues/2557))
* **Grid:**
  * fix buildColumns handling same field ([dd6dc150](http://github.com/angular-ui/ng-grid/commit/dd6dc1505b68a865b1c37197c133acbf5a5e58e0), closes [#2789](http://github.com/angular-ui/ng-grid/issues/2789))
  * Redraw needs scrollTop when adding rows ([509e0071](http://github.com/angular-ui/ng-grid/commit/509e0071b1929adecb6e75be20166902a70452ad))
  * Adjust available width for columns ([cf86090f](http://github.com/angular-ui/ng-grid/commit/cf86090f66ee057f541961d563ca42597112bdb4), closes [#2521](http://github.com/angular-ui/ng-grid/issues/2521), [#2734](http://github.com/angular-ui/ng-grid/issues/2734), [#2592](http://github.com/angular-ui/ng-grid/issues/2592))
  * Alter mousewheel event handling ([382f0aed](http://github.com/angular-ui/ng-grid/commit/382f0aeda61a5afde845c8faaed7b04def6fa162))
* **Pinning:** Move rowStyle() to uiGridViewport ([09f478c2](http://github.com/angular-ui/ng-grid/commit/09f478c2af4a5f47f8b144484fe71b96f62aa64b), closes [#2821](http://github.com/angular-ui/ng-grid/issues/2821))
* **Scrolling:** Don't trap scroll at 100% down ([78a4b433](http://github.com/angular-ui/ng-grid/commit/78a4b433b4f186a23a2ec35afe88660f8f361119))
* **cellNav:** Allow tabbing out of grid ([aabcd4da](http://github.com/angular-ui/ng-grid/commit/aabcd4da564391296d182d78415ab51f9853df64), closes [#2339](http://github.com/angular-ui/ng-grid/issues/2339))
* **uiGridHeader:**
  * Refresh grid with new header ([d841b92b](http://github.com/angular-ui/ng-grid/commit/d841b92b8538f0683a2b4dbaf3d84c1273459eaa), closes [#2822](http://github.com/angular-ui/ng-grid/issues/2822))
  * Fix dynamic header heights ([893bb13e](http://github.com/angular-ui/ng-grid/commit/893bb13e08c3c8fac9e886b5021777d752761c2d))
  * Fix header height growth bug ([fee00cdf](http://github.com/angular-ui/ng-grid/commit/fee00cdfa5aeaeb5a10db8ea71e64035eb39bba0), closes [#2781](http://github.com/angular-ui/ng-grid/issues/2781))
* **uiGridRenderContainer:**
  * Use header min-height ([4381ca58](http://github.com/angular-ui/ng-grid/commit/4381ca5857ac09a5e752a95bf18a0356e58de9f8), closes [#2768](http://github.com/angular-ui/ng-grid/issues/2768))
  * Don't reverse X delta ([7a0e075d](http://github.com/angular-ui/ng-grid/commit/7a0e075d73bc9ff876466754404ba6f41decdcfd))

<a name="v3.0.0-rc.19"></a>
### v3.0.0-rc.19 (2015-02-11)


#### Bug Fixes

* **Filtering:** Let mobile devices tap filter box ([01c22acf](http://github.com/angular-ui/ng-grid/commit/01c22acf18847cc7646e405c13f50cb0b0407835))
* **Grid:**
  * Add css to allow iOS momentum scroll ([48fd5021](http://github.com/angular-ui/ng-grid/commit/48fd5021a19e3792dbc04de55770bfc26a95ce53), closes [#2671](http://github.com/angular-ui/ng-grid/issues/2671))
  * Allow col reordering with column defs ([865573cd](http://github.com/angular-ui/ng-grid/commit/865573cd61df80ed5de22b8fd5da424d4c9dcd8b), closes [#1948](http://github.com/angular-ui/ng-grid/issues/1948))
  * refactor(core) ui-grid $parent scope is now automatically assigned to grid.appScope.  gridOptions.appScopeProvider can be used to assign anything to grid.appScope

* **GridColumn:** Allow for duplicate field coldefs ([82a72130](http://github.com/angular-ui/ng-grid/commit/82a7213057a7d4c559e470c534a6ca834cad2fb6), closes [#2364](http://github.com/angular-ui/ng-grid/issues/2364))
* **GridRenderContainer:** Redraw with scroll % ([bc2c68ab](http://github.com/angular-ui/ng-grid/commit/bc2c68aba48cdd5a3e840a589fb90cdba363618c), closes [#2357](http://github.com/angular-ui/ng-grid/issues/2357))
* **Mobile:**
  * Don't prevent default container touches ([8fe4e498](http://github.com/angular-ui/ng-grid/commit/8fe4e498caca973c6bcaac737841e38875ed9d37))
  * Allow either touch and mouse events ([654e0ce8](http://github.com/angular-ui/ng-grid/commit/654e0ce83f1ebd824341ab3d63b6d38495a67b80))
  * Bind only to touch or mouse events ([995d3c47](http://github.com/angular-ui/ng-grid/commit/995d3c472530407d19124e622c570fa65319e6fb))
* **Selection:** Fix selection w/ row templates ([b1a57b69](http://github.com/angular-ui/ng-grid/commit/b1a57b693fb9715198f42d411345ed18548a660b))
* **Tests:**
  * Mistakenly using classList ([04d2fa69](http://github.com/angular-ui/ng-grid/commit/04d2fa694a8e0b02baaf6dcabd4b882c72a4157d))
  * Use fork of csv-js ([ef78823c](http://github.com/angular-ui/ng-grid/commit/ef78823c380dd2ed48829a02d27bdf7f395f23d3))
  * angular 1.3 compiles style blocks ([c7b0a66f](http://github.com/angular-ui/ng-grid/commit/c7b0a66fd42f14b2f6626660aff97d6ca6ab6c67))
  * Add global for Protractor ([77969eb6](http://github.com/angular-ui/ng-grid/commit/77969eb6500aa4384286a939eefa8c4ef0332960))
  * Allow touch event simulation ([2dc02753](http://github.com/angular-ui/ng-grid/commit/2dc0275391b37a1a316dee8a1418c200da5f4347))
* **Tutorials:** Point back to angular 1.2.26 ([96625e2a](http://github.com/angular-ui/ng-grid/commit/96625e2ac8924051e6b6ec00224e565884a6fdbf))
* **cellNav:** If cellNav api exists, turn on stuff ([14264540](http://github.com/angular-ui/ng-grid/commit/14264540c4402e77f1cb64458b568146457f6dbe), closes [#2294](http://github.com/angular-ui/ng-grid/issues/2294))
   *refactor(cellNav) remove unused $scope parameter from api methods
* **uiGridHeaderCell:**
  * Change test measure method ([7774d30e](http://github.com/angular-ui/ng-grid/commit/7774d30e6085a0f98850a94880961f0511ddce50))
  * Adjust test width measure ([1f786b9c](http://github.com/angular-ui/ng-grid/commit/1f786b9c05c5330480809645c4cd3b549861c720))
* **uiGridRow:**
  * Use promise to get compiled elm fn ([5160b805](http://github.com/angular-ui/ng-grid/commit/5160b8057301c773a3ec62dab43b5c29819737a8))
  * Fix memory leak ([64d3918b](http://github.com/angular-ui/ng-grid/commit/64d3918b55c5dcb01772697cf8fcfd10dac945a4))
* **edit:**   edit cell scope was not being destroyed when element was removed
* **gridApi** add ability to pass _this variable in api.feature.on.eventName

#### Performance
* **Grid** encapsulate the renderContainer canvasHeight and GridRow.height properties Changes getCanvasHeight function to only recalculate all the row heights when needed.  Adds a CanvasH
eightChanged event to api.core




#### Features

* **Core:** Implementation for #2483.  Adds a showGridFooter option that will create a grid  ([d0233601](http://github.com/angular-ui/ng-grid/commit/d0233601a67a445049a710fe84dacdb0b64c1c33))
          * Adds a showGridFooter option that will create a grid footer with the Total Items and Shown Items displayed.  Also shows Selected Items if using Selection feature.

* **cellnav:** provide row option to disallow all cells from having focus ([1bc05ebc](http://github.com/angular-ui/ng-grid/commit/1bc05ebc775a81fd164c562a343bb5d0dd7e7578))
* **uiGridRow:** Allow dynamic row templates ([a547a52e](http://github.com/angular-ui/ng-grid/commit/a547a52e7b699ffd33bd4c5eb661b22d4c066b39))


#### Breaking Changes
* getExternalScopes() function is removed.  Use grid.appScope instead.
  external-scopes attribute is removed.  Use gridOptions.appScopeProvider to assign values other than $scope.$parent to appScope

* removed scope parameter from grid.api.cellNav methods
  old:
     scrollTo($scope, rowEntity, colDef)
 	  scrollToFocus($scope, rowEntity, colDef)
 	  scrollToIfNecessary($scope, row, col)
 	 new:
     scrollTo(rowEntity, colDef)
 	  scrollToFocus(rowEntity, colDef)
 	  scrollToIfNecessary(row, col
* scrollbars.WHEN_NEEDED no longer an option
* showFooter option renamed to showColumnFooter;  footerRowHeight option renamed to columnFooterHeight
 ([d0233601](http://github.com/angular-ui/ng-grid/commit/d0233601a67a445049a710fe84dacdb0b64c1c33))
* On mobile devices the user will have to long-click to
edit a cell instead of double-clicking
 ([654e0ce8](http://github.com/angular-ui/ng-grid/commit/654e0ce83f1ebd824341ab3d63b6d38495a67b80))
* **rowEdit:** * remove grid from all method signatures
* **importer:** * remove grid from importFile signature
* **core:** * remove grid from notifyDataChange signature


<a name="v3.0.0-RC.18"></a>
### v3.0.0-RC.18 (2014-12-09)

#### Bug Fixes

* **Builds:** Switch to websockets to get SauceLabs tests running again

<a name="v3.0.0-RC.17"></a>
### v3.0.0-RC.17 (2014-12-08)


#### Bug Fixes

* **Aggregation:** Refactor introduced bug ([a54c6639](http://github.com/angular-ui/ng-grid/commit/a54c6639fb9db0dbb1e85346cd445f316f59c1f4))
* **Builds:** Turn off Safari 5 for SL ([3cf645ea](http://github.com/angular-ui/ng-grid/commit/3cf645eaaf3c119ee41822a2d1bee4a3c31b9c05))
* **Edit:** Remove leftover console.log() ([3b707584](http://github.com/angular-ui/ng-grid/commit/3b7075840bf6d4788f6c1786654372e90e7a4df3))
* **Header:** Hidden header height misplacement ([783fefbd](http://github.com/angular-ui/ng-grid/commit/783fefbd89ab51c7257c57c7e592c5aa086d664f), closes [#1995](http://github.com/angular-ui/ng-grid/issues/1995))
* **Pinning:** Add left border for right container ([e409c54b](http://github.com/angular-ui/ng-grid/commit/e409c54bef5cddc5dfeb4bd4e84d171114960d5a))
* **RTL:** Put filter cancel on left for RTL ([0885e509](http://github.com/angular-ui/ng-grid/commit/0885e509e9fe46e58f3b016e342088f138cb072c), closes [#2058](http://github.com/angular-ui/ng-grid/issues/2058))
* **Tests:** Accidentally left in a ddescribe ([e6cf438a](http://github.com/angular-ui/ng-grid/commit/e6cf438a6fda31338427c7bb51f0b998d9b351bb))
* **cellNav:** Don't setup when directive not there ([9bfa6e3f](http://github.com/angular-ui/ng-grid/commit/9bfa6e3f638548f3f78c565f142771ca65e580bd), closes [#2128](http://github.com/angular-ui/ng-grid/issues/2128))


#### Breaking Changes

* The `hideHeader` option has been changed to `showHeader`

To migrate, change your code from the following:

`hideHeader: true`

To:

`showHeader: false`
 ([783fefbd](http://github.com/angular-ui/ng-grid/commit/783fefbd89ab51c7257c57c7e592c5aa086d664f))

<a name="v3.0.0-rc.16"></a>
### v3.0.0-rc.16 (2014-11-13)


#### Bug Fixes

* **Edit:** Retain "focus" in endEdit() ([f3a45ef5](http://github.com/angular-ui/ng-grid/commit/f3a45ef51e5f49c11490654cb757b579163e45ba))
* **Filter:** Watch running w/o change check ([79f6c21a](http://github.com/angular-ui/ng-grid/commit/79f6c21a45fe11e4ae87f3dd6eda8326bcfbb265))
* **Grid:** Avoid too-early header height calc ([a335b922](http://github.com/angular-ui/ng-grid/commit/a335b9223c397dca31d5db82f48d62e9b7b43187))
* **GridRenderContainer:** Correct prevScroll* ([1182b059](http://github.com/angular-ui/ng-grid/commit/1182b059ce64b3b5b4e49054b4737684393e5a19))
* **Selection:** Change api for getSelectAllState() ([5ffefafc](http://github.com/angular-ui/ng-grid/commit/5ffefafc000351a71b269ce2265f2faddb35b6e7), closes [#2086](http://github.com/angular-ui/ng-grid/issues/2086))
* **cellNav:**
  * Don't lose focus with wrapping nav ([0e27c181](http://github.com/angular-ui/ng-grid/commit/0e27c1815d9fe1aabce2a9ba981bb75655f08979))
  * Minor fixes and speed improvement ([94a31149](http://github.com/angular-ui/ng-grid/commit/94a31149ca0282612d7dc85d87d2a68f2c12367c))
* **gridUtil:** Allow multiple logDebug params ([c903ecc8](http://github.com/angular-ui/ng-grid/commit/c903ecc89fabebceed576f4ca637bb3c5277a32c))
* **uiGrid:**
  * syntax error, change variable name ([63fedb6c](http://github.com/angular-ui/ng-grid/commit/63fedb6c87ac7b60d3362ce3f9359fdf070848ed))
  * syntax error, change variable name ([181dec76](http://github.com/angular-ui/ng-grid/commit/181dec76aed49ff03a7f2c329ae8b6d65bdd594e))
  * Fix race condition in data watcher ([2b25f249](http://github.com/angular-ui/ng-grid/commit/2b25f249cd133a02f44eec34ccee7f4e77adab16), closes [#2053](http://github.com/angular-ui/ng-grid/issues/2053))
* **uiGridMenu:** Only run applyHide when not shown ([91bf06f2](http://github.com/angular-ui/ng-grid/commit/91bf06f289632f331fd125851282cb9f5b499bd4))

<a name="v3.0.0-rc.15"></a>
### v3.0.0-rc.15 (2014-11-11)


#### Bug Fixes

* **uiGridRenderContainer:** Inherit position ([fd353287](http://github.com/angular-ui/ng-grid/commit/fd353287639276083340ef96aa82749367f1deef), closes [#2030](http://github.com/angular-ui/ng-grid/issues/2030))


#### Features

* **Interpolation:** Handle custom symbols ([555ddecd](http://github.com/angular-ui/ng-grid/commit/555ddecddeb967f338f8bdf4da814d74f8b44495), closes [#1576](http://github.com/angular-ui/ng-grid/issues/1576))

<a name="v3.0.0-rc.14"></a>
### v3.0.0-rc.14 (2014-11-05)


#### Bug Fixes

* **bower:** Use right angular version spec ([6bd917a0](http://github.com/angular-ui/ng-grid/commit/6bd917a05527afe7f75db51bdaff24b44f554fd9))

<a name="v3.0.0-rc.13"></a>
### v3.0.0-rc.13 (2014-11-05)


#### Bug Fixes

* **AutoResize:** Redraw all of grid on resize. ([1bb5367c](http://github.com/angular-ui/ng-grid/commit/1bb5367cb304baeee6ca4ecc084cbc02601fb6f6), closes [#1770](http://github.com/angular-ui/ng-grid/issues/1770))
* **Importer:** Account for older browsers properly ([52823249](http://github.com/angular-ui/ng-grid/commit/528232492ea9860390dd8da1a604103b25f33719))

<a name="v3.0.0-rc.12"></a>
### v3.0.0-rc.12 (2014-10-08)


#### Bug Fixes

* **Customizer:** Update column menu style ([ffa80002](http://github.com/angular-ui/ng-grid/commit/ffa80002c983b5eb60a4357ba2d7150682f343a2))
* **Grid:** Fix a few mobile-browser issues ([4bb2d699](http://github.com/angular-ui/ng-grid/commit/4bb2d6996aad6463155bcd01b1521441cab45270))
* **Pinning:** Fix pinning when col has dyanmic width ([9e022bab](http://github.com/angular-ui/ng-grid/commit/9e022babd07f6261ce6b4325b791c744da895f91), closes [#1634](http://github.com/angular-ui/ng-grid/issues/1634))
* **RTL:** Unfixed .css() call post-jquery ([8d31f6a1](http://github.com/angular-ui/ng-grid/commit/8d31f6a1a2ae68d9c9b40fa6a2bcd3ed47febe96), closes [#1620](http://github.com/angular-ui/ng-grid/issues/1620))
* **Selection:** Remove IE11 ellipsis in header ([a8ac76c6](http://github.com/angular-ui/ng-grid/commit/a8ac76c638c65ef3c9a062f9efb7847ebc5ddd94))
* **Site:** Fix version select box height ([d2699092](http://github.com/angular-ui/ng-grid/commit/d2699092b0fd882c6ed2999595d5805854fa8749))
* **Tests:** Date() usage failing on Safari 5 ([6440d81c](http://github.com/angular-ui/ng-grid/commit/6440d81c6d2ca2604aff5e0f8904a6e66093b8a9))
* **Travis:** Make travis run saucelabs tests ([3bc3f272](http://github.com/angular-ui/ng-grid/commit/3bc3f272986c2cae55f26bc6ef8dd8f5fa6ef401))
* **grunt:** Use correct version of grunt-jscs ([e88600a0](http://github.com/angular-ui/ng-grid/commit/e88600a0118af1535be2e4f66c0e09c41aa15efa))
* **uiGridCell:** Use promises for tmpl processing ([9fb29cce](http://github.com/angular-ui/ng-grid/commit/9fb29cce5ea5f67c43d2aa5926a4f7a8aa4ba81c), closes [#1712](http://github.com/angular-ui/ng-grid/issues/1712))
* **uiGridHeader:** Fix height calculations ([cfc24442](http://github.com/angular-ui/ng-grid/commit/cfc24442e08d6e9956c7f94159ddf30b7db185f7), closes [#1639](http://github.com/angular-ui/ng-grid/issues/1639), [#NaN](http://github.com/angular-ui/ng-grid/issues/NaN))
* **uiGridHeaderCell:** Use hasClass() for IE9 ([7923f229](http://github.com/angular-ui/ng-grid/commit/7923f229a4657538923a535bb7bd5d501320c3b8))
* **uiGridMenu:** Set box-sizing: content box ([ee418f0d](http://github.com/angular-ui/ng-grid/commit/ee418f0de9c6bf5c727d7eed7daa153dce1c5dd1))
* **uiGridUtil:** getBorderSize() missing "width" ([174f2521](http://github.com/angular-ui/ng-grid/commit/174f25214caa10ec643db6c81aaa0f3511bf78f4))


#### Features

* **cellTemplates:** add MODEL_COL_FIELD to cellTemplate parsing so it can be used in ng-model #1633  ([66f3404a](http://github.com/angular-ui/ng-grid/commit/66f3404ade7ead010142ecf047e863f526d960a3))


<a name="v3.0.0-rc.NEXT"></a>
### v3.0.0-rc.NEXT Current Master

#### Breaking Changes
* editableCellTemplates should use MODEL_COL_FIELD instead of COL_FIELD.
https://github.com/angular-ui/ng-grid/issues/1633 MODEL_COL_FIELD variable was added to the cellTemplate and editCellTemplate for utilizing the bound field in ng-model.  Edit feature
was changed to use MODEL_COL_FIELD instead of COL_FIELD for consistency.


<a name="v3.0.0-rc.11"></a>
### v3.0.0-rc.11 (2014-09-26)

<a name="v3.0.0-rc.10"></a>
### v3.0.0-rc.10 (2014-09-25)


#### Bug Fixes

* typo ([1272cf65](http://github.com/angular-ui/ng-grid/commit/1272cf65659a0e84102be9b1fa63f659437383ca))
* **CHANGELOG:** anchor tag for v2.0.7 was wrong ([d0ecd310](http://github.com/angular-ui/ng-grid/commit/d0ecd31061c6dc20fa6a558dbc9e696debf83874))
* **column-resizing:** 100% width/height not needed on ui-grid-cell-contents, just ui-grid-inner-cell-c ([6912d14f](http://github.com/angular-ui/ng-grid/commit/6912d14fe4222afe3468df846487b922741ac16b))
* **customizer:** point to ui-grid-unstable.css at top of page ([4892fbc4](http://github.com/angular-ui/ng-grid/commit/4892fbc4804c1bdf39ef6af07b51bcf753ef0849))
* **grunt:**
  * Add testDependencies file array to karma config for travis ([7a15fe42](http://github.com/angular-ui/ng-grid/commit/7a15fe42e85f11962e000fe34a1cb67d6a28ef5e))
  * typo ([0f641c0f](http://github.com/angular-ui/ng-grid/commit/0f641c0ff055f06ea50b54f86e6c686a2d69284b))
  * cut-release wasn't running done() ([025c61b2](http://github.com/angular-ui/ng-grid/commit/025c61b28807d0b6160bbb9d50b12ea42e881695))
  * Make getVersion() work on travis ([129f28b8](http://github.com/angular-ui/ng-grid/commit/129f28b8ae5c6c5678945fbd279c91788ea19a20))
* **less:** header variables were in file twice ([f93f675c](http://github.com/angular-ui/ng-grid/commit/f93f675c2bbb491ebe3fce27ebeb00e9adc5cca8))
* **travis:**
  *  Need only one script command in travis.yml ([2278c691](http://github.com/angular-ui/ng-grid/commit/2278c69122b9bd1b8aaf2225160e015b4a161fab))
  * had grunt args out of order ([c790245a](http://github.com/angular-ui/ng-grid/commit/c790245ace77b6856d4c046f3a08d4ded188648d))
  * use SauceLabs for e2e tests on travis ([5d8a21da](http://github.com/angular-ui/ng-grid/commit/5d8a21da57a466541aef5b16b032a21e46bbf15b))
  * accidentally switched a couple words ([d67c1871](http://github.com/angular-ui/ng-grid/commit/d67c1871a748d036cc386acc559a7dcfd80a32c3))
* **ui-grid-body:**
  * normalize mouse wheel events because browsers suck ([2075bf3c](http://github.com/angular-ui/ng-grid/commit/2075bf3c04e68b0bbedb378f6d16e7cfe5b4e149))
  * scrolling with mousewheel works ([7933c1a4](http://github.com/angular-ui/ng-grid/commit/7933c1a4f353aaebe5ecb2e9c06fd472564b8152))
* **uiGrid:**
  * introduced a bug that added columns over and over when data was swapped ([7fc55b5d](http://github.com/angular-ui/ng-grid/commit/7fc55b5d255b5940139717e35e891a7b3a5bee3a))
  * Fix elm height calc for hidden grids ([420a0dcf](http://github.com/angular-ui/ng-grid/commit/420a0dcf00351d3b5c256f38da1bc2796d869ddf))
* **uiGridCell:** re-compile if template changes ([7485e6ef](http://github.com/angular-ui/ng-grid/commit/7485e6efc8ee8105b3bb835e7f82d7f1997dcac6))
* **uiGridHeader:**
  * handle leftover pixels ([64941b3a](http://github.com/angular-ui/ng-grid/commit/64941b3a82b5ae72b1c75b1e46a6dfed2d68a696))
  * Fix header height calculation ([b1562854](http://github.com/angular-ui/ng-grid/commit/b1562854c808814695ab436b2ba63cd1afa28d4d))
* **uiGridStyle:** <br>s were being needlessly added ([ade12ec9](http://github.com/angular-ui/ng-grid/commit/ade12ec98f82400ddbc25ac2676fc88e66408164))


#### Features

* **AutoResize:** Adding auto-resize feature. ([d0bdd829](http://github.com/angular-ui/ng-grid/commit/d0bdd8295121a9b58a8a3f8ca3a52cdcba400fc0))
* **RTL:** Adding RTL support and fixing virtualization ([d5a9982d](http://github.com/angular-ui/ng-grid/commit/d5a9982d1f6562ad4a379cfcf53165247065fe3f))
* **Selection:** Updates ([b20c41c1](http://github.com/angular-ui/ng-grid/commit/b20c41c1715d7c5745bee7c3ea05ec585ab9bd16))
* **e2e:** protractor testing of docs now works properly with 'grunt dev' ([08787be4](http://github.com/angular-ui/ng-grid/commit/08787be454890a3fbaae324c6741670a59a50f3f))
* **filtering:** Add row filtering ([16161643](http://github.com/angular-ui/ng-grid/commit/16161643fa4eb925e816252937fadfabc59f55a0))
* **row-hashing:** Add new row hashing feature ([da87ff9a](http://github.com/angular-ui/ng-grid/commit/da87ff9a4082c0f9f8996d4bdb5225ce191392ef))
* **rowSort:** Added row sorting ([ce330978](http://github.com/angular-ui/ng-grid/commit/ce330978fe566e9695c30acef04e55221e520960))
* **uiGridStyle:** Added ui-grid-style directive ([5687723f](http://github.com/angular-ui/ng-grid/commit/5687723f318ac322fa84ce96cc9b7cb97e2946f2))

<a name="2.0.7"></a>
## 2.0.7 *(2013-07-01)*

### Features
This release is mainly focused on fixing the grid layout/column widths:

Columns
----------------------------------

*  Removed border-left and border-right from columns. Now we are using vertical bars so if someone sets a width to be 400px for a column, the column will actually be 400px, not 401-402px due to the border. This caused the horizontal overflowing to happen producing a horizontal scrollbar. This also fixed issues like https://github.com/angular-ui/ng-grid/issues/411 where you would see columns not extend all the way to the edge and you would get double borders
* Percent calculation is handled before asterisks calculations because percent calculation should take higher priority, and the asterisks calculations will then be able to fill the remaining space instead of horizontally overflowing the viewport


----------------------------------
A fix contributed by @swalters for #436:

Editing Cells
----------------------------------

When editing a cell, the ng-cell-has-focus directive will broadcast a message named ngGridEventStartCellEdit to let all children know that you can now give yourself focus. When the editable cell template is done with editing (usually on a blur event) you need to emit ngGridEventEndCellEdit to let ng-cell-has-focus know that you are done editing and it will then show the non-editable cell template. The reasoning for this is (good quote): "Now I can wrap my input elements in divs/spans, whatever and control exactly what element's blur triggers the end edit" - @swalters. An example (used for ng-input directive):

scope.$on('ngGridEventStartCellEdit', function () {
    elm.focus();
 });

angular.element(elm).bind('blur', function () {
    scope.$emit('ngGridEventEndCellEdit');
});

Also, there is another option now which is enableCellEditOnFocus (yes, it's coming back) so now you can choose between excel-like editing or enabling edit mode on focus.

----------------------------------
Also some fixes contributed by @ebbe-brandstrup are:

configureColumnWidths
----------------------------------
* Columns sized with * or % now expand / shrink as other * or %-based columns are hidden / shown
  * Note: the changes auto-expand/shrink only take effect on-the-fly
  * Works with grouping and when enabling the selection checkbox row (showSelectionCheckbox)
* Bugfixes in configureColumnWidths
  * Re-ordered columns now keep their width setup
  * Fixed "asteriskNum" so it no longer includes hidden columns (was checking .visible on a columnDefs column instead of the matching ngColumn)
  * Fixed "totalWidth" so it no longer includes hidden columns when using px values for width (was checking .visible on a columnDefs column instead of the matching ngColumn)
  * Fixed ngColumn width being initialized to undefined when using "auto" for width, regardless of "minWidth" settings (was checking .minWidth on a columnDefs column instead of the matching ngColumn)

Renamed "col" to "colDef" in configureColumnWidths() in the places where "col" was a column from "columnDefs". It made it clearer for me whether I was referring to a ngColumn or a column from columnDefs. There were a couple of bugs caused by that (col.visible incorrectly accessed on columnDefs objects instead of ngColumns, and the like).

ng-grid-flexible-height plugin
----------------------------------------
* Bugfixes in ng-grid-flexible-height
  * The plugin couldn't shrink the grid, only grow it
  * Using domUtilityService.UpdateGridLayout instead of grid.refreshDomSizes which correctly grows the grid if it's been shrunk (e.g. when paging to the last page and it has few rows + the plugin has a smaller min. height than what's needed on the other pages)

### Bug fixes
Too many to list. Here is the pull request https://github.com/angular-ui/ng-grid/pull/511


<a name="2.0.6"></a>
## 2.0.6 *(2013-06-?)*

### Features

- **Development**
  - Continuous integration testing with [Travis CI](https://travis-ci.org/angular-ui/ng-grid). A few tests that were looking for pixel perfection had to be relaxed due to rendering differences between browsers and OSes.
  - Moved this changelog to CHANGELOG.md!
  - Added tests for i18n languages. Any new language must cover all the properties that the default language (English) has.
  - CSS files compiling with less ([24bb173](https://github.com/angular-ui/ng-grid/commit/24bb173))
  - Added optional --browsers flag for test tasks. `grunt test --browsers=Chrome,Firefox,PhantomJS` will test in all 3 browsers at once.

- **Sorting**
  - Allow optional '+' prefix to trigger numerical sort ([f3aff74](https://github.com/angular-ui/ng-grid/commit/f3aff74), [8e5c0a1](https://github.com/angular-ui/ng-grid/commit/8e5c0a1))
  - Standardizing sort arrow direction (thanks @dcolens) ([9608488](https://github.com/angular-ui/ng-grid/commit/9608488))

- **i18n**
  - Added Brazilian Portugeuse (thanks @dipold) ([ab0f207](https://github.com/angular-ui/ng-grid/commit/ab0f207))

### Bug fixes

- Allow column `displayName` to be an empty string. ([#363](https://github.com/angular-ui/ng-grid/issues/363), [46a992f](https://github.com/angular-ui/ng-grid/commit/46a992f))
- Fix for `totalServerItems` not updating ([#332](https://github.com/angular-ui/ng-grid/issues/332), [#369](https://github.com/angular-ui/ng-grid/issues/369), [fcfe316](https://github.com/angular-ui/ng-grid/commit/fcfe316))
- Fixed regression in [2.0.5](#2.0.5) that used Array.forEach, which isn't supported in IE8. Moved to angular.forEach ([e4b08a7](https://github.com/angular-ui/ng-grid/commit/e4b08a7))
- Fixed and added tests for wysiwyg-export plugin ([57df36f](https://github.com/angular-ui/ng-grid/commit/57df36f))
- Fixed extraneous trailing comma ([#449](https://github.com/angular-ui/ng-grid/issues/449), [2c655c7](https://github.com/angular-ui/ng-grid/commit/2c655c7))
- **Cell editing** - various attempts at fixing broken cell editing eventually resulted in using [NgModelController](http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController) (thanks @swalters). ([#442](https://github.com/angular-ui/ng-grid/issues/442), [050a1ba](https://github.com/angular-ui/ng-grid/commit/050a1ba), [5c82f9b](https://github.com/angular-ui/ng-grid/commit/5c82f9b), [5c82f9b](https://github.com/angular-ui/ng-grid/commit/5c82f9b), [f244363](https://github.com/angular-ui/ng-grid/commit/f244363), [ee2a5f1](https://github.com/angular-ui/ng-grid/commit/ee2a5f1))

<a name="2.0.5"></a>
## 2.0.5 *(2013-04-23)*

### Features

- Moving to $http for external template fetching. Should fix issues with grid rendering before templates are retrieved, as well as fetching the same template multiple times.

### Bug fixes

- Fixed bug that prevented the grid from maintaining row selections post-sort thanks to [sum4me](https://github.com/sum4me)

<a name="2.0.4"></a>
## 2.0.4 *(2013-04-08)*

### Bug fixes

- Fixing some more minor bugs

<a name="2.0.3"></a>
## 2.0.3 *(2013-03-29)*

- Changed default multiSelect behavior, updating some plugins and making some more minor bugfixes.

<a name="2.0.2"></a>
## 2.0.2 *(2013-03-08)*

- minor bugfixes, updating some plugins.

<a name="2.0.1"></a>
## 2.0.1 *(2013-03-05)*

 - Moved to grunt build system. No more international version; all languages are included by default. Fixed minor grouping display issue. Using $templateCache for templates instead of global namespace.

<a name="2.0.0"></a>
## 2.0.0 *(2013-03-05)*

 - Breaking Changes: see documentation (showSelectionBox, enableRowSelection, showFooter). Column Virtualization added. Row virtualization performance improved. Excel-like editing instead of enableFocusedCellEdit.

<a name="1.9.0"></a>
## 1.9.0 *(2013-02-18)*

 - Aggregates now display correctly. Added more option methods to select and group data (see wiki), Added column pinning.

<a name="1.8.0"></a>
## 1.8.0 [Hotfix] *(2013-02-11)*

 - Fixes for multi-level grouping and adding the gridId to both the grid options and as argument to the "ngGridEventData" so you can identify what grid it came from.

<a name="1.8.0"></a>
## 1.8.0 *(2013-02-07)*

 - Major architectural changes which greatly improves performance. virtualizationThreshold now controlls when virtualization is force-enabled and is user-specified in options.

<a name="1.7.1"></a>
## 1.7.1 *(2013-02-06)*

 - Fixed bug with selections and multiple grids. New emit message for notifying when hitting bottom of viewport. Can disable virtualization. ng-grid virtualization is on by default, but can be disabled if there are less than 50 rows in the grid. Anything > 50 rows virtualization is forced on for performance considerations.

<a name="1.7.0"></a>
## 1.7.0 *(2013-02-05)*

 - BREAKING CHANGES: Will add examples. Adding cell selection, navigation, and edit on focus. Added programmatic selections. Improved scrolling. ngGridEvents changed/added: see wiki.

<a name="1.6.3"></a>
## 1.6.3 *(2013-01-17)*

 - Can now highlight/copy text in grid. Fixed multiple issues when using multiselect along with shift key. Refactored key events so now they are all in the same directive for viewport. Hovering over highlightable text will change cursors in viewport. Fixed #93.

<a name="1.6.2"></a>
## 1.6.2 *(2013-01-09)*

 - Merged changes to have two-way data-binding work in templates, so if you're using a celltemplate, you can now use COL_FIELD instead of row.getProperty(col.field). row.getProperty is still in the row class for accessing other row values.

<a name="1.6.1"></a>
## 1.6.1 *(2013-01-08)*

 - Adding ability to preselect rows. Can deselect when multiSelect:false. Bug fixes/merging pull requests. Bower now works. Can now sync external search with ng-grid internal search. Check out other examples on examples page.

<a name="1.6.0"></a>
## 1.6.0 *(2012-12-27)*

 - Adding i18n support and support for different angularjs interpolation symbols (requires building from source).

<a name="1.5.0"></a>
## 1.5.0 *(2012-12-20)*

 - Modifying the way we watch for array changes. Added groupable column definition option. Bugfixes for #58, #59.

<a name="1.4.1"></a>
## 1.4.1 *(2012-12-18)*

 - jslint reformat, minor bugfixes, performance improvements while keydown navigating, adding "use strict" to script.

<a name="1.4.0"></a>
## 1.4.0 *(2012-12-12)*

 - Massive improvements to search thanks to [iNeedFat](https://github.com/ineedfat)!

<a name="1.3.9"></a>
## 1.3.9 *(2012-12-12)*

 - Refactored and removed unneeded code. Added scope events.

<a name="1.3.7"></a>
## 1.3.7 *(2012-12-12)*

 - Improving template compilation and fixing jquery theme support. Improving comments on grid options.

<a name="1.3.6"></a>
## 1.3.6 *(2012-12-06)*

 - sortInfo can now be set to default sort the grid. Improvements to the beforeSelectionChange callback mechanism when multi-selecting.

<a name="1.3.5"></a>
## 1.3.5 *(2012-12-06)*

 - Improved template rendering when using external template files. columnDefs can now be a $scope object which can be push/pop/spliced. Fixed box model for cells and header cells.

<a name="1.3.4"></a>
## 1.3.4 *(2012-12-04)*

 - Improved aggregate grouping, minor bugfixes. Auto-width works!

<a name="1.3.2"></a>
## 1.3.2 *(2012-11-27)*

 - Changed default width behavior to use *s and added option to maintain column ratios while resizing

<a name="1.3.1"></a>
## 1.3.1 *(2012-11-27)*

 - Added layout plugin. Support for uri templates. Performance improvements.

<a name="1.3.0"></a>
## 1.3.0 *(2012-11-23)*

 - Major code refactoring, can now group-by using column menu, changes to build

<a name="1.2.2"></a>
## 1.2.2 *(2012-11-21)*

 - Built-in filtering support, numerous perfomance enhancements and minor code refactoring

<a name="1.2.1"></a>
## 1.2.1 *(2012-11-20)*

 - Added ability to specify property "paths" as fields and for grid options.

<a name="1.2.0"></a>
## 1.2.0 *(2012-11-19)*

 - Added Server-Side Paging support and minor bug fixes.

<a name="1.1.0"></a>
## 1.1.0 *(2012-11-17)*

 - Added ability to hide/show columns and various bug fixes/performance enhancements.

<a name="1.0.0"></a>
## 1.0.0 *(2012-11-14)*

 - Release
