import crypto from "crypto";

const generateRandomString = () => crypto.randomBytes(20).toString("hex");

export { generateRandomString };
