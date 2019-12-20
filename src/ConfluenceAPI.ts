import { AuthHeaders } from "./types/AuthHeaders";
import * as axios from "axios";
import * as fs from "fs";
import signale from "signale";

const axiosFile = require("axios-file");

export class ConfluenceAPI {
    private readonly authHeaders: AuthHeaders;
    private readonly baseUrl: string;

    constructor(baseUrl: string, username: string, password: string) {
        this.baseUrl = baseUrl;
        this.authHeaders = {
            auth: {
                username: username,
                password: password,
            },
        };
    }

    async updateConfluencePage(pageId: string, newPage: any) {
        await axios.default.put(`${this.baseUrl}/content/${pageId}`, newPage, {
            headers: {
                "Content-Type": "application/json",
            },
            ...this.authHeaders,
        });
    }

    async deleteAttachments(pageId: string) {
        const attachments = await axios.default.get(
            `${this.baseUrl}/content/${pageId}/child/attachment`,
            this.authHeaders,
        );
        for (const attachment of attachments.data.results) {
            try {
                signale.await(`Deleting attachment "${attachment.title}" ...`);
                await axios.default.delete(`${this.baseUrl}/content/${attachment.id}`, this.authHeaders);
            } catch (e) {
                signale.error(`Deleting attachment "${attachment.title}" failed ...`);
            }
        }
    }

    async uploadAttachment(filename: string, pageId: string) {
        try {
            await axiosFile({
                url: `${this.baseUrl}/content/${pageId}/child/attachment`,
                method: "post",
                headers: {
                    "X-Atlassian-Token": "nocheck",
                },
                data: {
                    file: fs.createReadStream(filename),
                },
                ...this.authHeaders,
            });
        } catch (e) {
            signale.error(`Uploading attachment "${filename}" failed ...`);
        }
    }

    async convertToWikiFormat(mdWikiData: string) {
        return await axios.default.post(
            `${this.baseUrl}/contentbody/convert/storage`,
            {
                value: mdWikiData,
                representation: "wiki",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }

    async currentPage(pageId: string) {
        return axios.default.get(`${this.baseUrl}/content/${pageId}?expand=body.storage,version`, this.authHeaders);
    }
}
