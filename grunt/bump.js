module.exports = {
  options: {
    files: ['package.json', 'package-lock.json', 'bower.json'],
    commitFiles: ['package.json', 'package-lock.json', 'bower.json', 'CHANGELOG.md'],
    push: false,
    commitMessage: 'chore: Release v%VERSION%'
  }
};
