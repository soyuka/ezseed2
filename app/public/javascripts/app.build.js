({
    name: 'main.build',
    mainConfigFile : "main.build.js",
    baseUrl: "./",
    optimize: 'uglify2',
    paths: {
        jquery: "empty:"
    },
    out: '../js/main.min.js'
})