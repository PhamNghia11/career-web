module.exports = {
    apps: [
        {
            name: "gdu-career",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                MONGODB_URI: "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0"
            }
        }
    ]
};
