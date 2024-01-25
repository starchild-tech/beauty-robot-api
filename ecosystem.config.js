module.exports = {
    apps: [
        {
            name: "beauty-robot-api",
            script: "./src/server.js",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
                DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
            },
        },
    ],
};
