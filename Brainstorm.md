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
> We need to do a default rendering anyway, so yes, we would auto-generate column headers and columns. 
We'll have the code to do so in order to do some core demo/default implementation- even if we're successful and can get this thing fully customizable. 

> rob

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

> I like this.  There are lots of use cases we have to account for if we're going with this pattern, but at least as far as the basics I think it's clear.
> Declarative pinning might look something like this?
> rob

```html

<div class="grid">
  <div ui-grid-header>
    <!-- auto-generate column headers if no content supplied? -->
    <!-- how to mark-up pinned columns so they align with resepective pinned grid-body below? -->
  </div>
  <div class="grid-body pinned left" ui-virtualize="data as $rows">
    <div ng-repeat="row in $rows">
      <div ng-repeat="column in row">
      </div>
    </div>
  <div class="grid-body" ui-virtualize="data as $rows">
    <div ng-repeat="row in $rows">
      <div ng-repeat="column in row">
      </div>
    </div>
    <div class="grid-body pinned right" ui-virtualize="data as $rows">
    <div ng-repeat="row in $rows">
      <div ng-repeat="column in row">
      </div>
    </div>
  </div>
</div>
```
