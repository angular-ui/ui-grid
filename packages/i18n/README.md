# UI-Grid i18n

The language packs for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core). These are needed if you would like to use UI-Grid in a language other than English. Our language support is highly extensive, but also highly dependent on the greater UI-Grid community to remain up-to-date and accurate since the core team does not speak most of the supported languages.

All of the languages provided in this package can be used via the *i18nService*, which you can use to change the default language, add translations, or change existing translations.

## Getting Started

You can install `@ui-grid/i18n` via:

```shell
npm i --save @ui-grid/i18n
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/i18n/js/ui-grid.language.[YOUR_LANGUAGE_HERE].js"></script>
 
<!-- Alternatively you can load all languages provided with you grid by loading the following -->
<script src="/node_modules/@ui-grid/i18n/js/ui-grid.language.all.js"></script>

```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/i18n'); // this loads all languages
```

Once you load the file, the easiest way to set the language is to use the ui-i18n directive in a div that contains the grid. However, only one ui-i18n directive is allowed, so the current language setting is stored in the i18n service (singleton) and there is currently no way to have more than one language per app.

```html
<div ui-i18n="{{lang}}">
```

Another option to set the language is to use the i18nService and use the setCurrentLang method:

```javascript
i18nService.setCurrentLang('fr');
```

### Example

You can find an example of our language packs in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20104%20i18n)

## API Documentation

Documentation for the i18nService is provided in the [api documentation](http://ui-grid.info/docs/#!/api/ui.grid.i18n.service:i18nService).

## Issues

You can find issues that are specific to localization in UI-Grid by looking for the label [grid-i18n](https://github.com/angular-ui/ui-grid/labels/grid-i18n) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)