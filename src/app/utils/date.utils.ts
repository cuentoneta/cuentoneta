export type DateString = `${string | number}-${string | number}-${string | number}`;

export const isLeapYear = (year: number | string) => {
	const yearAsInt = typeof year === 'string' ? parseInt(year, 10) : year;
	return (yearAsInt % 4 === 0 && yearAsInt % 100 !== 0) || yearAsInt % 400 === 0;
};

export function isValidDateString(date: string): boolean {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(date)) {
		return false;
	}

	const [year, month, day] = date.split('-').map(Number);
	if (month < 1 || month > 12) {
		return false;
	}

	// Check for February and leap years
	if (month === 2) {
		const maxDays = isLeapYear(year) ? 29 : 28;
		return day >= 1 && day <= maxDays;
	}

	return true;
}
