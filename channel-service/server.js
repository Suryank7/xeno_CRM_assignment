const app = require('./src/app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`📡 Xeno Pulse Channel Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
