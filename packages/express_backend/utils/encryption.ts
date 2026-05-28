import crypto from "crypto";
import { config } from "dotenv";
config({ path: "../../.env" });

const ALGORITHM = "aes-256-gcm";
const KEY = process.env.FIELD_ENCRYPTION_KEY;

if (!KEY) {
	throw new Error("FIELD_ENCRYPTION_KEY is missing");
}

const ENCRYPTION_KEY = Buffer.from(KEY, "hex");

if (ENCRYPTION_KEY.length !== 32) {
	throw new Error("FIELD_ENCRYPTION_KEY must be 64 hex characters");
}

export type EncryptedField = {
	encryptedData: string;
	iv: string;
	authTag: string;
};

export function encryptField(value: string): EncryptedField {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

	const encrypted = Buffer.concat([
		cipher.update(value, "utf8"),
		cipher.final(),
	]);

	const authTag = cipher.getAuthTag();

	return {
		encryptedData: encrypted.toString("hex"),
		iv: iv.toString("hex"),
		authTag: authTag.toString("hex"),
	};
}

export function decryptField(data?: EncryptedField): string | undefined {
	if (!data) return undefined;

	const decipher = crypto.createDecipheriv(
		ALGORITHM,
		ENCRYPTION_KEY,
		Buffer.from(data.iv, "hex")
	);

	decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(data.encryptedData, "hex")),
		decipher.final(),
	]);

	return decrypted.toString("utf8");
}
