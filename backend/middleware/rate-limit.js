const rateLimit = (options) => {
    const { windowMs, max } = options;
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip; // Use the IP address as the key
        const currentTime = Date.now();

        // Initialize the request count if it doesn't exist
        if (!requests.has(key)) {
            requests.set(key, { count: 1, startTime: currentTime });
        } else {
            const requestData = requests.get(key);

            // Check if the time window has expired
            if (currentTime - requestData.startTime < windowMs) {
                if (requestData.count < max) {
                    requestData.count += 1; // Increment the count
                } else {
                    return res.status(429).json({ error: "Too many requests, please try again later." });
                }
            } else {
                // Reset the count and start time
                requests.set(key, { count: 1, startTime: currentTime });
            }
        }

        next(); // Proceed to the next middleware or route handler
    };
};

module.exports = rateLimit; 