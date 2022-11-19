jest.mock("../../src/UpdatePage");
jest.mock("../../src/FileConfigLoader");
jest.mock("../../src/api/ConfluenceAPI");

import { ConfluenceAPI } from "../../src/api/ConfluenceAPI";
import { FileConfigLoader } from "../../src/FileConfigLoader";
import { updatePage } from "../../src/UpdatePage";
import MainCommand from "../../src/cli/MainCommand";
import { generateRandomString } from "../helper/data";

const mockedUpdatePage = updatePage as jest.MockedFunction<typeof updatePage>;
const mockedConfluenceAPI = ConfluenceAPI as jest.MockedClass<typeof ConfluenceAPI>;
const mockedFileConfigLoaderLoadFunction = FileConfigLoader.load as jest.MockedFunction<typeof FileConfigLoader.load>;

describe("MainCommand", () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    it("calls the updatePage function with the correct parameters", async () => {
        const randomNumber = Math.floor(Math.random() * 10) + 5; // random between 5 and 15.
        const randomPages = [];
        for (let i = 0; i < randomNumber; ++i) {
            randomPages.push({
                pageId: generateRandomString(),
                file: generateRandomString(),
            });
        }
        const config = {
            baseUrl: "baseUrl",
            cachePath: ".cache",
            prefix: "prefix",
            cleanupLocalAttachmentFiles: false,
            pages: randomPages,
            configPath: "path",
            authorizationToken: "token",
            customRenderer: undefined,
        };

        mockedFileConfigLoaderLoadFunction.mockResolvedValueOnce(config);
        const confluenceApiInstanceMock = jest.fn();
        // @ts-ignore We can safely ignore what is returned since we just care about the parameters
        mockedConfluenceAPI.mockReturnValueOnce(confluenceApiInstanceMock);
        const path = generateRandomString();
        await expect(MainCommand(path)).resolves.not.toThrow();
        expect(mockedFileConfigLoaderLoadFunction.mock.calls).toHaveLength(1);
        expect(mockedFileConfigLoaderLoadFunction.mock.calls[0][0]).toBe(path);

        expect(mockedConfluenceAPI.mock.calls).toHaveLength(1);
        expect(mockedConfluenceAPI.mock.calls[0][0]).toBe("baseUrl");
        expect(mockedConfluenceAPI.mock.calls[0][1]).toBe("token");
        expect(mockedConfluenceAPI.mock.calls[0][2]).toBe(false);

        expect(mockedUpdatePage.mock.calls).toHaveLength(randomNumber);
        for (let i = 0; i < randomNumber; ++i) {
            expect(mockedUpdatePage.mock.calls[i][0]).toBe(confluenceApiInstanceMock);
            expect(mockedUpdatePage.mock.calls[i][1]).toBe(randomPages[i]);
            expect(mockedUpdatePage.mock.calls[i][2]).toBe(config);
            expect(mockedUpdatePage.mock.calls[i][3]).toBe(false);
        }
    });
});
