module.exports = {
  dist: {
    src: '.tmp/nuget/*.nupkg',
    options: {
        apiKey: process.env.NUGET_API_KEY
    }
  }
};
