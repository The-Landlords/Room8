export type PasswordStrength = "Weak" | "Medium" | "Strong";

export function getPasswordChecks(password: string) {
	return {
		hasLength: password.length >= 8,
		hasUpper: /[A-Z]/.test(password),
		hasLower: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSymbol: /[^A-Za-z0-9]/.test(password),
	};
}

export function getPasswordStrength(password: string): PasswordStrength {
	const checks = getPasswordChecks(password);
	const score = Object.values(checks).filter(Boolean).length;

	if (score <= 2) return "Weak";
	if (score <= 4) return "Medium";
	return "Strong";
}

export function isValidPassword(password: string) {
	const checks = getPasswordChecks(password);

	return (
		checks.hasLength &&
		checks.hasUpper &&
		checks.hasLower &&
		checks.hasNumber &&
		checks.hasSymbol
	);
}
