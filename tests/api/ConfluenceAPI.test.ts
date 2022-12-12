import { ConfluencePage } from "../../src/UpdatePage";
import { ConfluenceAPI } from "../../src/api/ConfluenceAPI";
import axios from "axios";
import { Agent } from "https";
import { Attachment } from "../../src/api/Attachment";
import signale from "signale";

jest.mock("axios");
jest.mock("signale");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ConfluenceAPI", () => {
    let confluenceAPI: ConfluenceAPI;

    beforeEach(() => {
        confluenceAPI = new ConfluenceAPI("", "Bearer unbearable", false);
    });

    it("fetches current version of confluence page", async () => {
        mockedAxios.get.mockResolvedValue({ data: "Test" });

        await confluenceAPI.currentPage("2");

        expect(mockedAxios.get).toHaveBeenCalledWith("/content/2?expand=body.storage,version", {
            headers: {
                Authorization: "Bearer unbearable",
                "Content-Type": "application/json",
            },
            httpsAgent: expect.any(Agent),
        });
    });

    it("does a retry if first update of confluence page fails", async () => {
        mockedAxios.put.mockRejectedValueOnce(null);

        await confluenceAPI.updateConfluencePage("2", confluencePage);

        expect(mockedAxios.put).toHaveBeenNthCalledWith(2, "/content/2", confluencePage, {
            headers: {
                Authorization: "Bearer unbearable",
                "Content-Type": "application/json",
            },
            httpsAgent: expect.any(Agent),
        });
        expect(signale.await).toHaveBeenCalledWith(`First attempt failed, retrying ...`);
    });

    it("fetches attachments of confluence page", async () => {
        await confluenceAPI.getAttachments("2");

        expect(mockedAxios.get).toHaveBeenCalledWith("/content/2/child/attachment", {
            headers: {
                Authorization: "Bearer unbearable",
                "Content-Type": "application/json",
            },
            httpsAgent: expect.any(Agent),
        });
    });

    it("deletes attachments of confluence page", async () => {
        await confluenceAPI.deleteAttachment(attachment);

        expect(mockedAxios.delete).toHaveBeenCalledWith("/content/attachment-id", {
            headers: {
                Authorization: "Bearer unbearable",
                "Content-Type": "application/json",
            },
            httpsAgent: expect.any(Agent),
        });
    });

    it("does not throw if delete fails", async () => {
        mockedAxios.delete.mockRejectedValueOnce(null);

        await confluenceAPI.deleteAttachment(attachment);

        expect(signale.error).toHaveBeenCalledWith(`Deleting attachment "attachment-name" failed ...`);
    });

    it("updates attachments of confluence page", async () => {
        mockedAxios.get.mockResolvedValue({});

        await confluenceAPI.uploadAttachment("my-file", "2");
        expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    });

    it("does not throw if uploading attachment fails", async () => {
        mockedAxios.request.mockRejectedValueOnce(null);

        await confluenceAPI.uploadAttachment("my-file", "2");

        expect(signale.error).toHaveBeenCalledWith(`Uploading attachment "my-file" failed ...`);
    });

    const attachment: Attachment = {
        id: "attachment-id",
        title: "attachment-name",
        metadata: {
            mediaType: "png",
            labels: {
                results: [],
                start: 1,
                limit: 1,
                size: 1,
            },
        },
        extensions: {
            mediaType: "png",
            fileSize: 1,
            comment: "some comment",
        },
    };

    const confluencePage: ConfluencePage = {
        title: "string",
        body: {
            storage: {
                value: "string",
                representation: "storage",
            },
        },
        version: {
            number: "1.0",
        },
    };
});
