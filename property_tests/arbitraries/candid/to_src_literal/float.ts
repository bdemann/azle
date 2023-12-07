export function floatToSrcLiteral(value: number): string {
    if (Number.isNaN(value)) {
        return 'Number.NaN';
    }
    if (Number.isFinite(value)) {
        return value.toString();
    }
    if (value > 0) {
        return 'Number.POSITIVE_INFINITY';
    }
    return 'Number.NEGATIVE_INFINITY';
}