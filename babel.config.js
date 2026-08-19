// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'], // Expo use kar rahe ho toh 'babel-preset-expo' hoga
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    // Agar 'react-native-reanimated/plugin' hai toh wo hamesha last mein aana chahiye
  ],
};