const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: 'localhost', // Change this if your Redis server is hosted elsewhere
    port: 6379, // Default Redis port
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Redis error:', err);
});

// Export the Redis client
module.exports = client;
