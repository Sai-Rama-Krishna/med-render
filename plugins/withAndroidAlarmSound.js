const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAndroidAlarmSound = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res',
        'raw'
      );

      // Create the raw directory if it doesn't exist
      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
      }

      // Path to your custom sound file in the assets folder
      const soundAssetPath = path.join(projectRoot, 'assets', 'alarm.wav');
      const soundDestPath = path.join(resPath, 'alarm.wav');

      // Copy the file
      if (fs.existsSync(soundAssetPath)) {
        fs.copyFileSync(soundAssetPath, soundDestPath);
      }

      return config;
    },
  ]);
};

module.exports = withAndroidAlarmSound;
