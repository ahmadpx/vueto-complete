module.exports = {
  devServer: {
    proxy: "https://www-dev.tajawal.com/",
    https: true,
    port: 5000,
    host: "www-dev.tajawal.local"
  }
};
