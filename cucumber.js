module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["features/**/*.ts"],
    format: ["progress"],
    tags: "not @postgres",
    publishQuiet: true
  },
  postgres: {
    paths: ["features/**/*.feature"],
    requireModule: ["ts-node/register"],
    require: ["features/**/*.ts"],
    format: ["progress"],
    tags: "@postgres",
    publishQuiet: true
  }
};
