# Declaritive HTML

```html
<div ui-grid>
  <div ui-grid-header>
    <!-- auto-generate column headers if no content supplied? -->
  </html>
  
  <!-- ui-grid-repeat auto-generates columns, ui-repeat-virtual handles the actual virtual repeater functionality? -->
  <div ui-grid-repeat  ui-repeat-virtual="d in data">
    <!-- auto-generate columns if no content supplied? -->
  </div>
  
  <!-- or perhaps this?? (from ProLoser) -->
  <ng-repeat="item in $virtualized" ui-virtualize="items">
  <!--
    ui-virtualize virtualizes a list of items and hands it to the built-in repeater, if the repeater is performant enough
  -->
</div>
```
