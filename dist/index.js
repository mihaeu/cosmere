"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var axios = require("axios");
var axiosFile = require("axios-file");
var inquirer = require("inquirer");
var markdown2confluence = require("markdown2confluence");
var path = require("path");
function readConfigFromFile(configPath) {
    configPath = configPath || path.join("markdown2confluence.json");
    if (!fs.existsSync(configPath)) {
        console.error("File markdown2confluence.json not found!");
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
}
function overwriteAuthFromConfigWithEnvIfPresent(config) {
    config.user = process.env.MD2CUSER || config.user;
    config.pass = process.env.MD2CPASS || config.pass;
    return config;
}
function promptUserAndPassIfNotSet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var prompts, answers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompts = [];
                    if (!config.user) {
                        prompts.push({
                            type: "input",
                            name: "user",
                            message: "Your Confluence username:",
                        });
                    }
                    if (!config.pass) {
                        prompts.push({
                            type: "password",
                            name: "pass",
                            message: "Your Confluence password:",
                        });
                    }
                    return [4 /*yield*/, inquirer.prompt(prompts)];
                case 1:
                    answers = _a.sent();
                    config.user = config.user || answers.user;
                    config.pass = config.pass || answers.pass;
                    return [2 /*return*/, config];
            }
        });
    });
}
function convertToWikiFormat(config, mdWikiData, auth) {
    return __awaiter(this, void 0, void 0, function () {
        var newContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.post(config.baseUrl + "/contentbody/convert/storage", {
                        value: mdWikiData,
                        representation: "wiki",
                    }, __assign({ headers: {
                            "Content-Type": "application/json",
                        } }, auth))];
                case 1:
                    newContent = _a.sent();
                    return [2 /*return*/, newContent];
            }
        });
    });
}
function updateConfluencePage(currentPage, pageData, newContent, config, auth) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentPage.title = pageData.title;
                    currentPage.body = {
                        storage: {
                            value: newContent.data.value,
                            representation: "storage",
                        },
                    };
                    currentPage.version.number = parseInt(currentPage.version.number, 10) + 1;
                    return [4 /*yield*/, axios.put(config.baseUrl + "/content/" + pageData.pageId, currentPage, __assign({ headers: {
                                "Content-Type": "application/json",
                            } }, auth))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteAttachments(pageData, config, auth) {
    return __awaiter(this, void 0, void 0, function () {
        var attachments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get(config.baseUrl + "/content/" + pageData.pageId + "/child/attachment", auth)];
                case 1:
                    attachments = _a.sent();
                    attachments.data.results.forEach(function (attachment) { return axios.delete("https://confluence.tngtech.com/rest/api/content/" + attachment.id, auth); });
                    return [2 /*return*/];
            }
        });
    });
}
function updatePage(pageData, config, force) {
    return __awaiter(this, void 0, void 0, function () {
        var fileData, mdWikiData, prefix, dir, tempFile, needsContentUpdate, fileContent, auth, newContent, currentPage;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.debug("Starting to render \"" + pageData.file + "\"");
                    fileData = fs.readFileSync(pageData.file, { encoding: "utf8" });
                    mdWikiData = markdown2confluence(fileData);
                    prefix = config.prefix;
                    if (prefix) {
                        mdWikiData = "{info}" + prefix + "{info}\n\n" + mdWikiData;
                    }
                    dir = "./tmp";
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    tempFile = dir + "/" + pageData.pageId;
                    needsContentUpdate = true;
                    if (fs.existsSync(tempFile)) {
                        fileContent = fs.readFileSync(tempFile, "utf-8");
                        if (fileContent === mdWikiData) {
                            needsContentUpdate = false;
                        }
                    }
                    if (!force && !needsContentUpdate) {
                        console.info("No content update necessary for \"" + pageData.file + "\"");
                        return [2 /*return*/];
                    }
                    auth = {
                        auth: {
                            username: config.user,
                            password: config.pass,
                        },
                    };
                    return [4 /*yield*/, convertToWikiFormat(config, mdWikiData, auth)];
                case 1:
                    newContent = _a.sent();
                    newContent.data.value = newContent.data.value.replace(/<ac:structured-macro ac:name="code"[\s\S]+?<ac:plain-text-body>([\s\S]+?)<\/ac:plain-text-body><\/ac:structured-macro>/, '<ac:structured-macro ac:name="plantuml" ac:schema-version="1"><ac:parameter ac:name="atlassian-macro-output-type">INLINE</ac:parameter><ac:plain-text-body>$1</ac:plain-text-body></ac:structured-macro>');
                    return [4 /*yield*/, deleteAttachments(pageData, config, auth)];
                case 2:
                    _a.sent();
                    newContent.data.value.match(/<ri:attachment ri:filename="(.+?)" *\/>/g)
                        .map(function (s) { return s.replace(/.*"(.+)".*/, '$1'); })
                        .filter(function (filename) { return fs.existsSync(filename); })
                        .forEach(function (filename) { return __awaiter(_this, void 0, void 0, function () {
                        var newFilename;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    newFilename = __dirname + '/../tmp/' + filename.replace('/..', '_').replace('/', '_');
                                    fs.copyFileSync(__dirname + '/../' + filename, newFilename);
                                    return [4 /*yield*/, uploadAttachment(newFilename, pageData, config, auth)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    newContent.data.value = newContent.data.value.replace(/<ri:attachment ri:filename=".+?"/g, function (s) { return s.replace('/', '_'); });
                    return [4 /*yield*/, axios.get(config.baseUrl + "/content/" + pageData.pageId, auth)];
                case 3:
                    currentPage = (_a.sent()).data;
                    return [4 /*yield*/, updateConfluencePage(currentPage, pageData, newContent, config, auth)];
                case 4:
                    _a.sent();
                    fs.writeFileSync(tempFile, mdWikiData, "utf-8");
                    console.info("\"" + currentPage.title + "\" saved in confluence.");
                    return [2 /*return*/];
            }
        });
    });
}
function uploadAttachment(filename, pageData, config, auth) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axiosFile(__assign({ url: config.baseUrl + "/content/" + pageData.pageId + "/child/attachment", method: 'post', headers: {
                            'X-Atlassian-Token': 'nocheck',
                        }, data: {
                            file: fs.createReadStream(filename)
                        } }, auth))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function md2confluence(configPath, force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promptUserAndPassIfNotSet(overwriteAuthFromConfigWithEnvIfPresent(readConfigFromFile(configPath)))];
                case 1:
                    config = _a.sent();
                    config.pages.forEach(function (pageData) { return updatePage(pageData, config, force); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.md2confluence = md2confluence;
