import axios from "axios";
import * as fs from "fs";
import signale from "signale";

export class ConfluenceAPI {
    private readonly baseUrl: string;
    private readonly authHeader: {
        Authorization: string;
    };

    constructor(baseUrl: string, authorizationToken: string) {
        this.baseUrl = baseUrl;
        this.authHeader = {
            Authorization: authorizationToken,
        };
    }

    async updateConfluencePage(pageId: string, newPage: any) {
        const config = {
            headers: {
                ...this.authHeader,
                "Content-Type": "application/json",
            },
        };
        try {
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, config);
        } catch (e) {
            signale.await(`First attempt failed, retrying ...`);
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, config);
        }
    }

    async deleteAttachments(pageId: string) {
        const attachments = await axios.get(`${this.baseUrl}/content/${pageId}/child/attachment`, {
            headers: this.authHeader,
        });
        for (const attachment of attachments.data.results) {
            try {
                signale.await(`Deleting attachment "${attachment.title}" ...`);
                await axios.delete(`${this.baseUrl}/content/${attachment.id}`, {
                    headers: this.authHeader,
                });
            } catch (e) {
                signale.error(`Deleting attachment "${attachment.title}" failed ...`);
            }
        }
    }

    async uploadAttachment(filename: string, pageId: string) {
        try {
            await require("axios-file")({
                url: `${this.baseUrl}/content/${pageId}/child/attachment`,
                method: "post",
                headers: {
                    "X-Atlassian-Token": "nocheck",
                    ...this.authHeader,
                },
                data: {
                    file: fs.createReadStream(filename),
                },
            });
        } catch (e) {
            signale.error(`Uploading attachment "${filename}" failed ...`);
        }
    }

    async currentPage(pageId: string) {
        return axios.get(`${this.baseUrl}/content/${pageId}?expand=body.storage,version`, {
            headers: this.authHeader,
        });
    }
}
