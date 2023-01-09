import axios from "axios";
import * as fs from "fs";
import signale from "signale";
import { GetAttachmentsResult } from "./GetAttachmentsResult";
import { Attachment } from "./Attachment";
import { Agent } from "https";
import FormData from "form-data";
import { ConfluencePage } from "../UpdatePage";

export class ConfluenceAPI {
    private readonly baseUrl: string;
    private readonly authHeader: {
        Authorization: string;
    };
    private readonly agent: Agent;

    constructor(baseUrl: string, authorizationToken: string, insecure: boolean) {
        this.baseUrl = baseUrl;
        this.authHeader = {
            Authorization: authorizationToken,
        };
        this.agent = new (require("https").Agent)({
            rejectUnauthorized: !insecure,
        });
    }

    async updateConfluencePage(pageId: string, newPage: ConfluencePage) {
        try {
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, this.config());
        } catch (e: any) {
            signale.error(e?.response?.data?.message ?? e);
            signale.await(`First attempt failed, retrying ...`);
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, this.config());
        }
    }

    async getAttachments(pageId: string): Promise<GetAttachmentsResult> {
        return (await axios.get(`${this.baseUrl}/content/${pageId}/child/attachment`, this.config())).data;
    }

    async deleteAttachment(attachment: Attachment) {
        try {
            signale.await(`Deleting attachment "${attachment.title}" ...`);
            await axios.delete(`${this.baseUrl}/content/${attachment.id}`, this.config());
        } catch (e) {
            signale.error(`Deleting attachment "${attachment.title}" failed ...`);
        }
    }

    async uploadAttachment(filename: string, pageId: string) {
        try {
            let form = new FormData();
            const readStream = fs.createReadStream(filename);
            form.append("file", readStream);
            await axios.request({
                url: `${this.baseUrl}/content/${pageId}/child/attachment?allowDuplicated=true`,
                method: "POST",
                headers: {
                    "X-Atlassian-Token": "nocheck",
                    ...this.authHeader,
                    ...form.getHeaders(),
                },
                httpsAgent: this.agent,
                maxContentLength: 1024 * 1024 * 100,
                data: {
                    file: readStream,
                },
            });
        } catch (e) {
            signale.error(`Uploading attachment "${filename}" failed ...`);
        }
    }

    async currentPage(pageId: string) {
        return axios.get(`${this.baseUrl}/content/${pageId}?expand=body.storage,version`, this.config());
    }

    private config() {
        return {
            headers: {
                ...this.authHeader,
                "Content-Type": "application/json",
            },
            httpsAgent: this.agent,
        };
    }
}
