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

    scale(number: number): Fraction {
        const newNumerator = this.numerator * number;
        return new Fraction(newNumerator, this.denominator).simplify();
    }

    subtract(fraction: Fraction): Fraction {
        return this.add(fraction.scale(-1));
    }

    simplify(): Fraction {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const commonDivisor = gcd(this.numerator, this.denominator);
        return new Fraction(this.numerator / commonDivisor, this.denominator / commonDivisor);
    }

    evaluate(): number {
        const simplified = this.simplify();
        return simplified.numerator / this.denominator;
    }

    toString(): string {
        return `${this.numerator}/${this.denominator}`;
    }
}
