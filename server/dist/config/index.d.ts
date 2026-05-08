/**
 * Application configuration object.
 * All environment variables are accessed through this object
 * to prevent typos and provide defaults.
 */
declare const config: {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    clientUrl: string;
};
export default config;
//# sourceMappingURL=index.d.ts.map