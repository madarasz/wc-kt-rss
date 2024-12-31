// Format is like "13 Dec 24"
export function parseMonthWithLettersDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split(' ');
    const months: { [key: string]: number; } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const date = new Date(Date.UTC(2000 + parseInt(year), months[month], parseInt(day), 9, 0, 0));
    return date;

}

// Format is like "13/12/24"
export function parseNumericDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
    const date = new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
    return date;
}
