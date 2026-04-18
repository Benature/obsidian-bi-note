import { moment } from 'obsidian';

const MOMENT_TOKENS = [
	'YYYYYY',
	'GGGGG',
	'ggggg',
	'YYYY',
	'GGGG',
	'gggg',
	'MMMM',
	'DDDD',
	'dddd',
	'SSSS',
	'YYY',
	'GGG',
	'ggg',
	'MMM',
	'DDD',
	'ddd',
	'SSS',
	'YY',
	'GG',
	'gg',
	'MM',
	'DD',
	'Do',
	'dd',
	'HH',
	'hh',
	'kk',
	'mm',
	'ss',
	'SS',
	'Qo',
	'Wo',
	'wo',
	'ZZ',
	'A',
	'a',
	'Q',
	'M',
	'D',
	'd',
	'H',
	'h',
	'k',
	'm',
	's',
	'S',
	'W',
	'w',
	'E',
	'e',
	'X',
	'x',
] as const;

/**
 * Format common moment tokens while keeping other path text literal.
 * Existing bracket-escaped literals are still supported for compatibility.
 */
export function formatPath(template: string, date: Date): string {
	const formattedDate = moment(date);
	let result = '';
	let index = 0;

	while (index < template.length) {
		const current = template[index];
		if (current === '[') {
			const closingIndex = template.indexOf(']', index + 1);
			if (closingIndex !== -1) {
				result += template.slice(index + 1, closingIndex);
				index = closingIndex + 1;
				continue;
			}
		}

		const token = findMomentToken(template, index);
		if (token) {
			result += formattedDate.format(token);
			index += token.length;
			continue;
		}

		result += current ?? '';
		index++;
	}

	return result;
}

function findMomentToken(template: string, startIndex: number): string | null {
	for (const token of MOMENT_TOKENS) {
		if (!template.startsWith(token, startIndex)) {
			continue;
		}

		if (token.length === 1 && !isStandaloneSingleLetterToken(template, startIndex)) {
			continue;
		}

		return token;
	}

	return null;
}

function isStandaloneSingleLetterToken(template: string, index: number): boolean {
	const previous = template[index - 1] ?? '';
	const next = template[index + 1] ?? '';
	return !isAsciiLetter(previous) && !isAsciiLetter(next);
}

function isAsciiLetter(value: string): boolean {
	return /^[A-Za-z]$/.test(value);
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
