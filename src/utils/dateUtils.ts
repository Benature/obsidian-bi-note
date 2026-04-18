/**
 * Replace YYYY, MM, DD tokens in a path template with the given date values.
 */
export function formatPath(template: string, date: Date): string {
	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return template
		.replace(/YYYY/g, year)
		.replace(/MM/g, month)
		.replace(/DD/g, day);
}

/**
 * Return the vault-relative file path for a given template and date.
 * Appends ".md" if the template does not already end with it.
 */
export function getFilePath(template: string, date: Date): string {
	const path = formatPath(template, date);
	return path.endsWith('.md') ? path : `${path}.md`;
}

export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}
