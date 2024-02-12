import { compileTypeScriptToJavaScript } from './compile_typescript_code';
import { dim, red } from './utils/colors';
import { Err, ok, unwrap } from './utils/result';
import {
    AzleError,
    JSCanisterConfig,
    TsCompilationError,
    TsSyntaxErrorLocation
} from './utils/types';

export function getCanisterJavaScript(
    canisterConfig: JSCanisterConfig,
    wasmedgeQuickJsPath: string
): string {
    const typeScriptCompilationResult = compileTypeScriptToJavaScript(
        canisterConfig.main,
        wasmedgeQuickJsPath
    );

    if (!ok(typeScriptCompilationResult)) {
        const azleErrorResult = compilationErrorToAzleErrorResult(
            typeScriptCompilationResult.err
        );
        unwrap(azleErrorResult);
    }

    const canisterJavaScript = typeScriptCompilationResult.ok as string;

    return canisterJavaScript;
}

function compilationErrorToAzleErrorResult(error: unknown): Err<AzleError> {
    if (isTsCompilationError(error)) {
        const firstError = error.errors[0];
        const codeSnippet = generateVisualDisplayOfErrorLocation(
            firstError.location
        );
        return Err({
            error: `TypeScript error: ${firstError.text}`,
            suggestion: codeSnippet,
            exitCode: 5
        });
    } else {
        return Err({
            error: `Unable to compile TS to JS: ${error}`,
            exitCode: 6
        });
    }
}

function isTsCompilationError(error: unknown): error is TsCompilationError {
    if (
        error &&
        typeof error === 'object' &&
        'stack' in error &&
        'message' in error &&
        'errors' in error &&
        'warnings' in error
    ) {
        return true;
    }
    return false;
}

function generateVisualDisplayOfErrorLocation(
    location: TsSyntaxErrorLocation
): string {
    const { file, line, column, lineText } = location;
    const marker = red('^'.padStart(column + 1));
    const preciseLocation = dim(`${file}:${line}:${column}`);
    const previousLine =
        line > 1
            ? dim(`${(line - 1).toString().padStart(line.toString().length)}| `)
            : '';
    const offendingLine = `${dim(`${line}| `)}${lineText}`;
    const subsequentLine = `${dim(
        `${(line + 1).toString().padStart(line.toString().length)}| `
    )}${marker}`;
    return `${preciseLocation}\n${previousLine}\n${offendingLine}\n${subsequentLine}`;
}
