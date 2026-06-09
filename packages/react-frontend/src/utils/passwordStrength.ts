export type PasswordStrength = "Weak" | "Medium" | "Strong";

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

export function isCommonPassword(password: string) {
	return COMMON_PASSWORDS.has(normalizePassword(password));
}

export function getPasswordChecks(password: string) {
	return {
		hasLength: password.length >= 8,
		hasUpper: /[A-Z]/.test(password),
		hasLower: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSymbol: /[^A-Za-z0-9]/.test(password),
		isNotCommon: !isCommonPassword(password),
	};
}

export function getPasswordStrength(password: string): PasswordStrength {
	const checks = getPasswordChecks(password);
	const score = Object.values(checks).filter(Boolean).length;

	if (score <= 2) return "Weak";
	if (score <= 5) return "Medium";
	return "Strong";
}

export function isValidPassword(password: string) {
	const checks = getPasswordChecks(password);

	return (
		checks.hasLength &&
		checks.hasUpper &&
		checks.hasLower &&
		checks.hasNumber &&
		checks.hasSymbol &&
		checks.isNotCommon
	);
}
