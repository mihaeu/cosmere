export type Attachment = {
    id: string;
    title: string;
    metadata: {
        mediaType: string;
        labels: {
            results: [];
            start: number;
            limit: number;
            size: number;
        };
    };
    extensions: {
        mediaType: string;
        fileSize: number;
        comment: string;
    };
};
