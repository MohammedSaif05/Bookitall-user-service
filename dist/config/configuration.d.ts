declare const _default: () => {
    app: {
        name: string;
        env: string;
        port: number;
        globalPrefix: string;
    };
    database: {
        uri: string;
    };
    r2: {
        endpoint: string | undefined;
        bucket: string | undefined;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        region: string;
        publicBase: string | undefined;
    };
    ifsc: {
        apiKey: string;
    };
};
export default _default;
