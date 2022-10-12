function requireAll(lang) {
  lang.keys().forEach(lang);
}

requireAll(require.context('./js/', true, /\.js$/));
