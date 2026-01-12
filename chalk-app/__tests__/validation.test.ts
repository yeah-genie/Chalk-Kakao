const isValidName = (name: string) => {
    const regex = /^[a-zA-Z가-힣\s]{2,20}$/;
    return regex.test(name);
};

describe('Name Validation Logic', () => {
    test('should allow valid names', () => {
        expect(isValidName('김철수')).toBe(true);
        expect(isValidName('John Doe')).toBe(true);
        expect(isValidName('홍길동 A')).toBe(true);
        expect(isValidName('Grace')).toBe(true);
    });

    test('should reject too short or too long names', () => {
        expect(isValidName('A')).toBe(false); // Too short
        expect(isValidName('김')).toBe(false); // Too short
        expect(isValidName('a'.repeat(21))).toBe(false); // Too long
    });

    test('should reject special characters or numbers', () => {
        expect(isValidName('김철수! @#')).toBe(false);
        expect(isValidName('Tutor123')).toBe(false);
        expect(isValidName('John_Doe')).toBe(false);
    });

    test('should reject empty strings or whitespace only', () => {
        expect(isValidName('')).toBe(false);
        expect(isValidName('  ')).toBe(false);
    });
});
