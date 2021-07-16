module.exports = api => {
  api.cache(true);

  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-flow'
    ],
    env: {
      mocha: {
        plugins: [
          'istanbul'
        ]
      }
    },
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties'
    ]
  };
}
