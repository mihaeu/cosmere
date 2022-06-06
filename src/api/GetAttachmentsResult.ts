import { Attachment } from "./Attachment";

export type GetAttachmentsResult = {
    results: Attachment[];
    start: number;
    limit: number;
    size: number;
};
