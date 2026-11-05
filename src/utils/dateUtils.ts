import { moment } from 'obsidian';

/**
 * Format only brace-wrapped moment expressions, keeping all other path text literal.
 * Square-bracket literals remain supported for compatibility.
 */
export function formatPath(template: string, date: Date): string {
	const formattedDate = moment(date);
	let result = '';
	let index = 0;

	while (index < template.length) {
		const current = template[index];
		const closingBracket = current === '[' ? ']' : current === '{' ? '}' : null;

		if (closingBracket) {
			const closingIndex = template.indexOf(closingBracket, index + 1);
			if (closingIndex !== -1) {
				const content = template.slice(index + 1, closingIndex);
				result += current === '{' ? formattedDate.format(content) : content;
				index = closingIndex + 1;
				continue;
			}
		}

		result += current ?? '';
		index++;
	}

	return result;
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
