module.exports = {
    apps: [
        {
            name: "gdu-career",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                MONGODB_URI: "mongodb://localhost:27017/gdu_career"
            },
            instances: "max",
            exec_mode: "cluster"
        }
    ]
};
