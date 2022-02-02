import { ConfluenceAPI } from "../../src/api/ConfluenceAPI";
import axios from "axios";
import { mocked } from "ts-jest/utils";

jest.mock('axios');
const axiosMock = mocked(axios, true);

describe("ConfluenceAPI", () => {
  it("fetches current version of confluence page using basic auth", async () => {
    axiosMock.get.mockResolvedValue({ data: "Test"});

    const confluenceAPI = new ConfluenceAPI("", { user: "", pass: "" });
    await confluenceAPI.currentPage("2");
    expect(axiosMock.get).toHaveBeenCalledWith(
      "/content/2?expand=body.storage,version",
      {
        auth: {
          password: "",
          username: ""
        }
      }
    );
  });

  it("fetches current version of confluence page using auth token", async () => {
    axiosMock.get.mockResolvedValue({ data: "Test"});

    const authToken = "foo";
    const confluenceAPI = new ConfluenceAPI("", { authToken });
    await confluenceAPI.currentPage("2");
    expect(axiosMock.get).toHaveBeenCalledWith(
      "/content/2?expand=body.storage,version",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      }
    );
  });
});