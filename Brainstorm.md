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


## Alternative

```html
<div class="grid">
  <div ui-grid-header>
    <!-- auto-generate column headers if no content supplied? -->
  </div>
  
  <div class="grid-body" ui-virtualize="data as $rows">
    <!-- virtualize creates `$rows` that is passed to ng-repeat -->
    <div ng-repeat="row in $rows">
      
      
      <div ng-repeat="column in row">
        <!-- ability to define custom columns -->
        <!-- ability to virtualize columns too:
        <div ng-repeat="column in $columns" ui-virtualize="row as $columns">
        -->
      </div>
      
      <!-- or pretty much a default template of the above snippet ^^ -->
      <ui-grid-row data="row"></ui-grid-row>
      
    </div>
  </div>
</div>
```
