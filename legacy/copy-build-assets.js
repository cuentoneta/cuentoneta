const fs = require('fs');

// File destination.txt will be created or overwritten by default.
fs.copyFile('OneSignalSDKWorker.js', 'www/OneSignalSDKWorker.js', (err) => {
    if (err) throw err;
    console.log('OneSignalSDKWorker.js was copied to www/OneSignalSDKWorker.js');
});
