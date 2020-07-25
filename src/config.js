module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
};
