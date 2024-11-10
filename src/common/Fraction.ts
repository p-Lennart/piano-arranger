export default class Fraction {
    numerator: number;
    denominator: number;

    constructor(numerator: number, denominator: number) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
    
    add(fraction: Fraction): Fraction {
        const newNumerator = this.numerator * fraction.denominator + fraction.numerator * this.denominator;
        const newDenominator = this.denominator * fraction.denominator;
        return new Fraction(newNumerator, newDenominator).simplify();
    }

    simplify(): Fraction {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const commonDivisor = gcd(this.numerator, this.denominator);
        return new Fraction(this.numerator / commonDivisor, this.denominator / commonDivisor);
    }

    toString(): string {
        return `${this.numerator}/${this.denominator}`;
    }
}
