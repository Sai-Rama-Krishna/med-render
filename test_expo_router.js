try {
  const router = require('expo-router');
  console.log("SUCCESS:", Object.keys(router));
} catch (e) {
  console.log("ERROR:", e.message);
  console.log(e.stack);
}
