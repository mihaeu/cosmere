import { AuthConfig, isBasicAuth, isTokenAuth } from "../types/Config";
import axios, { AxiosRequestConfig } from "axios";
import * as fs from "fs";
import signale from "signale";


export class ConfluenceAPI {
    constructor(
        private readonly baseUrl: string,
        private readonly authConfig: AuthConfig
    ) {}

    async updateConfluencePage(pageId: string, newPage: any) {
        const config = this.appendAuthHeaders({
            headers: {
                "Content-Type": "application/json",
            },
        });

        try {
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, config);
        } catch (e) {
            signale.await(`First attempt failed, retrying ...`);
            await axios.put(`${this.baseUrl}/content/${pageId}`, newPage, config);
        }
    }

    async deleteAttachments(pageId: string) {
        const config = this.appendAuthHeaders({});
        const attachments = await axios.get(`${this.baseUrl}/content/${pageId}/child/attachment`, config);
        for (const attachment of attachments.data.results) {
            try {
                signale.await(`Deleting attachment "${attachment.title}" ...`);
                await axios.delete(`${this.baseUrl}/content/${attachment.id}`, config);
            } catch (e) {
                signale.error(`Deleting attachment "${attachment.title}" failed ...`);
            }
        }
    }

    async uploadAttachment(filename: string, pageId: string) {
        try {
            const config = this.appendAuthHeaders({
                url: `${this.baseUrl}/content/${pageId}/child/attachment`,
                method: "post",
                headers: {
                    "X-Atlassian-Token": "nocheck",
                },
                data: {
                    file: fs.createReadStream(filename),
                },
            });

            await require("axios-file")(config);
        } catch (e) {
            signale.error(`Uploading attachment "${filename}" failed ...`);
        }
    }

    async currentPage(pageId: string) {
        const config = this.appendAuthHeaders({});
        return axios.get(`${this.baseUrl}/content/${pageId}?expand=body.storage,version`, config);
    }

    private appendAuthHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
        if (isBasicAuth(this.authConfig)) {
            return {
                ...config,
                auth: {
                    username: this.authConfig.user,
                    password: this.authConfig.pass,
                },
            };
        }
        else if (isTokenAuth(this.authConfig)) {
            return {
                ...config,
                headers: {
                    ...(config.headers ?? {}),
                    "Authorization": `Bearer ${this.authConfig.authToken}`,
                }
            }
        }
        else {
            throw Error("No credentials found in config");
        }
    }
}
