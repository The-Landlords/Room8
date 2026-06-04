describe("encryption utils", () => {
	beforeEach(() => {
		jest.resetModules();

		process.env.FIELD_ENCRYPTION_KEY =
			"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
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
});
