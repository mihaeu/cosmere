jest.mock("axios");

import { ConfluenceAPI } from "../../src/api/ConfluenceAPI";
import axios from "axios";
import { Agent } from "https";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ConfluenceAPI", () => {
    it("fetches current version of confluence page", async () => {
        // @ts-ignore We only care about the "data" field
        mockedAxios.get.mockResolvedValue({ data: "Test" });

        const confluenceAPI = new ConfluenceAPI("", "Bearer unbearable", false);
        await confluenceAPI.currentPage("2");
        expect(mockedAxios.get).toHaveBeenCalledWith("/content/2?expand=body.storage,version", {
            headers: {
                Authorization: "Bearer unbearable",
                "Content-Type": "application/json",
            },
            httpsAgent: expect.any(Agent),
        });
    });
});
