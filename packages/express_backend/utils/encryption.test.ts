describe("encryption utils", () => {
	const validKey =
		"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

	beforeEach(() => {
		jest.resetModules();
		process.env.FIELD_ENCRYPTION_KEY = validKey;
	});

	afterEach(() => {
		delete process.env.FIELD_ENCRYPTION_KEY;
		jest.resetModules();
	});

	it("encrypts and decrypts a phone number", async () => {
		const { encryptField, decryptField } = await import("./encryption");

		const originalPhone = "+15551234567";

		const encrypted = encryptField(originalPhone);

		expect(encrypted.encryptedData).not.toBe(originalPhone);
		expect(encrypted.iv).toBeDefined();
		expect(encrypted.authTag).toBeDefined();

		const decrypted = decryptField(encrypted);

		expect(decrypted).toBe(originalPhone);
	});

	it("encrypts and decrypts a DOB", async () => {
		const { encryptField, decryptField } = await import("./encryption");

		const originalDOB = new Date("2000-01-01").toISOString();

		const encrypted = encryptField(originalDOB);

		expect(encrypted.encryptedData).not.toBe(originalDOB);

		const decrypted = decryptField(encrypted);

		expect(decrypted).toBe(originalDOB);
	});

	it("returns undefined when decrypting missing data", async () => {
		const { decryptField } = await import("./encryption");

		expect(decryptField()).toBeUndefined();
	});

	it("creates different encrypted output for the same value", async () => {
		const { encryptField } = await import("./encryption");

		const firstEncrypted = encryptField("same-value");
		const secondEncrypted = encryptField("same-value");

		expect(firstEncrypted.iv).not.toBe(secondEncrypted.iv);
		expect(firstEncrypted.encryptedData).not.toBe(
			secondEncrypted.encryptedData
		);
	});

	it("throws when FIELD_ENCRYPTION_KEY is missing", async () => {
		delete process.env.FIELD_ENCRYPTION_KEY;
		jest.resetModules();

		await expect(import("./encryption")).rejects.toThrow(
			"FIELD_ENCRYPTION_KEY is missing"
		);
	});

	it("throws when FIELD_ENCRYPTION_KEY is not 64 hex characters", async () => {
		process.env.FIELD_ENCRYPTION_KEY = "too-short";
		jest.resetModules();

		await expect(import("./encryption")).rejects.toThrow(
			"FIELD_ENCRYPTION_KEY must be 64 hex characters"
		);
	});
});
