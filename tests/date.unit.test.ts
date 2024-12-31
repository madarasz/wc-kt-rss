import { parseMonthWithLettersDate, parseNumericDate } from '../src/utils/parse-date'

const invalidDateString = 'Invalid Date';

describe('Date Parsing Functions', () => {
    describe('parseMonthWithLettersDate', () => {
        it('should parse dates with 3-letter months correctly', () => {
            const date = parseMonthWithLettersDate('13 Dec 24');
            expect(date.toUTCString()).toBe('Fri, 13 Dec 2024 09:00:00 GMT');
        });

        it('should handle single-digit days', () => {
            const date = parseMonthWithLettersDate('5 Jan 24');
            expect(date.toUTCString()).toBe('Fri, 05 Jan 2024 09:00:00 GMT');
        });

        it('should handle all months correctly', () => {
            const testCases = [
                ['15 Jan 24', 'Mon, 15 Jan 2024 09:00:00 GMT'],
                ['15 Feb 24', 'Thu, 15 Feb 2024 09:00:00 GMT'],
                ['15 Mar 24', 'Fri, 15 Mar 2024 09:00:00 GMT'],
                ['15 Apr 24', 'Mon, 15 Apr 2024 09:00:00 GMT'],
                ['15 May 24', 'Wed, 15 May 2024 09:00:00 GMT'],
                ['15 Jun 24', 'Sat, 15 Jun 2024 09:00:00 GMT'],
                ['15 Jul 24', 'Mon, 15 Jul 2024 09:00:00 GMT'],
                ['15 Aug 24', 'Thu, 15 Aug 2024 09:00:00 GMT'],
                ['15 Sep 24', 'Sun, 15 Sep 2024 09:00:00 GMT'],
                ['15 Oct 24', 'Tue, 15 Oct 2024 09:00:00 GMT'],
                ['15 Nov 24', 'Fri, 15 Nov 2024 09:00:00 GMT'],
                ['15 Dec 24', 'Sun, 15 Dec 2024 09:00:00 GMT']
            ];

            testCases.forEach(([input, expected]) => {
                expect(parseMonthWithLettersDate(input).toUTCString()).toBe(expected);
            });
        });

        it('should display problem for invalid month', () => {
            expect(parseMonthWithLettersDate('13 Invalid 24').toUTCString()).toBe(invalidDateString);
        });

        it('should display problem for invalid format', () => {
            expect(parseMonthWithLettersDate('invalid date string').toUTCString()).toBe(invalidDateString);
        });
    });

    describe('parseNumericDate', () => {
        it('should parse dates with slashes correctly', () => {
            const date = parseNumericDate('13/12/2024');
            expect(date.toUTCString()).toBe('Fri, 13 Dec 2024 09:00:00 GMT');
        });

        it('should handle single-digit days and months', () => {
            const date = parseNumericDate('5/1/2024');
            expect(date.toUTCString()).toBe('Fri, 05 Jan 2024 09:00:00 GMT');
        });

        it('should handle different months correctly', () => {
            const testCases = [
                ['15/1/2024', 'Mon, 15 Jan 2024 09:00:00 GMT'],
                ['15/2/2024', 'Thu, 15 Feb 2024 09:00:00 GMT'],
                ['15/3/2024', 'Fri, 15 Mar 2024 09:00:00 GMT'],
                ['15/4/2024', 'Mon, 15 Apr 2024 09:00:00 GMT'],
                ['15/5/2024', 'Wed, 15 May 2024 09:00:00 GMT'],
                ['15/6/2024', 'Sat, 15 Jun 2024 09:00:00 GMT'],
                ['15/7/2024', 'Mon, 15 Jul 2024 09:00:00 GMT'],
                ['15/8/2024', 'Thu, 15 Aug 2024 09:00:00 GMT'],
                ['15/9/2024', 'Sun, 15 Sep 2024 09:00:00 GMT'],
                ['15/10/2024', 'Tue, 15 Oct 2024 09:00:00 GMT'],
                ['15/11/2024', 'Fri, 15 Nov 2024 09:00:00 GMT'],
                ['15/12/2024', 'Sun, 15 Dec 2024 09:00:00 GMT']
            ];

            testCases.forEach(([input, expected]) => {
                expect(parseNumericDate(input).toUTCString()).toBe(expected);
            });
        });

        it('should display error for invalid format', () => {
            expect(parseMonthWithLettersDate('invalid/date/string').toUTCString()).toBe(invalidDateString);
        });

        it('should display error for out of range month', () => {
            expect(parseMonthWithLettersDate('13/13/2024').toUTCString()).toBe(invalidDateString);
        });
    });
});