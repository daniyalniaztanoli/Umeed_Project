const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Prevent flow-parser WASM out-of-memory crashes on machines with
  // limited available memory by limiting parallel transform workers.
  maxWorkers: 2,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
