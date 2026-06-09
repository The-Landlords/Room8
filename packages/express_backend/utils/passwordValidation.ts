export function isValidPassword(password: string) {
	const COMMON_PASSWORDS = new Set([
		"password",
		"password1",
		"password1!",
		"password123",
		"password123!",
		"123456",
		"12345678",
		"123456789",
		"qwerty",
		"qwerty123",
		"admin",
		"admin123",
		"letmein",
		"welcome",
		"welcome123",
		"iloveyou",
		"abc123",
		"monkey",
		"dragon",
		"football",
		"baseball",
		"room8",
		"room8123",
	]);

	function normalizePassword(password: string) {
		return password.trim().toLowerCase();
	}

	function isCommonPassword(password: string) {
		return COMMON_PASSWORDS.has(normalizePassword(password));
	}

	return (
		password.length >= 8 &&
		/[A-Z]/.test(password) &&
		/[a-z]/.test(password) &&
		/\d/.test(password) &&
		/[^A-Za-z0-9]/.test(password) &&
		!isCommonPassword(password)
	);
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
	"Password must be at least 8 characters, include uppercase, lowercase, number, and symbol characters, and not be a common password.";
