import { inflate } from 'pako';
import { URL } from 'url';

import { azleFetch, serialize } from '.';
import { ic } from '../';
import { getUrl } from './url';

export type CandidHttpResponse = {
    status: bigint;
    headers: CandidHttpHeader[];
    body: Uint8Array;
};

export type CandidHttpHeader = {
    name: string;
    value: string;
};

export async function fetchHttp(
    input: RequestInfo | URL,
    init?: RequestInit | undefined
): Promise<Response> {
    const urlObject = getUrl(input);
    const url = `${urlObject.origin}${urlObject.pathname}${urlObject.search}`; // For some sad reason toString() on our URL object from wasmedge-quickjs doesn't return the fully formatted URL as as tring, it returns [object Object]
    const maxResponseBytes = getHttpMaxResponseBytes();
    const method = getHttpMethod(init);
    const headers = getHeaders(init);
    const body = await prepareRequestBody(init);
    const transform = getHttpTransform();
    const cycles = getCycles();

    const response = await azleFetch(`icp://aaaaa-aa/http_request`, {
        body: serialize({
            args: [
                {
                    url,
                    max_response_bytes: maxResponseBytes,
                    method,
                    headers,
                    body,
                    transform
                }
            ],
            cycles
        })
    });
    const responseJson: CandidHttpResponse = await response.json();

    const bodyIsGZipped =
        responseJson.headers.find(({ name, value }) => {
            return (
                name.toLowerCase() === 'content-encoding' &&
                value.toLowerCase() === 'gzip'
            );
        }) !== undefined;

    const unGZippedBody = bodyIsGZipped
        ? inflate(responseJson.body)
        : responseJson.body;

    // TODO do we need to handle chunked bodies at all?
    // TODO do we need to handle a chunked body on the frontend too?
    // TODO if so we can use the transfer-encoding chunked processing in server.ts
    // TODO seems the reason I did this was obviated after gzipping
    // TODO gzipping handled the chunked encoding and produced a full body
    // TODO but I assume it is possible for a chunked non-gzipped body to occur too
    // const bodyIsChunked =
    //     responseJson.headers.find(({ name, value }) => {
    //         return (
    //             name.toLowerCase() === 'transfer-encoding' &&
    //             value.toLowerCase() === 'chunked'
    //         );
    //     }) !== undefined;

    const finalBody = Buffer.from(unGZippedBody);

    // Using Response from wasmedge-quickjs doesn't seem ideal for the time being
    // It seems very tied to the low-level implementation at first glance
    // We will build up our own response for the time being
    return {
        status: Number(responseJson.status),
        statusText: '', // TODO not done
        arrayBuffer: async () => {
            return finalBody.buffer;
        },
        json: async () => {
            return JSON.parse(finalBody.toString());
        },
        text: async () => {
            return finalBody.toString();
        }
    } as any;
}

function getHttpMaxResponseBytes() {
    return globalThis._azleOutgoingHttpOptionsMaxResponseBytes === undefined
        ? []
        : [globalThis._azleOutgoingHttpOptionsMaxResponseBytes];
}

function getHttpMethod(init?: RequestInit | undefined) {
    if (init === undefined) {
        return {
            get: null
        };
    }

    if (init.method === undefined) {
        return {
            get: null
        };
    }

    if (
        init.method.toLowerCase() !== 'get' &&
        init.method.toLowerCase() !== 'head' &&
        init.method.toLowerCase() !== 'post'
    ) {
        throw new Error(
            `azleFetch: ${init.method} is not a supported HTTP method`
        );
    }

    return {
        [init.method.toLowerCase()]: null
    };
}

function getHttpTransform() {
    if (globalThis._azleOutgoingHttpOptionsTransformMethodName === undefined) {
        return [];
    }

    return [
        {
            function: [
                ic.id(),
                globalThis._azleOutgoingHttpOptionsTransformMethodName
            ],
            context:
                globalThis._azleOutgoingHttpOptionsTransformContext ??
                Uint8Array.from([])
        }
    ];
}

function getCycles(): bigint {
    return globalThis._azleOutgoingHttpOptionsCycles ?? 3_000_000_000n; // TODO this seems to be a conservative max size
}

// TODO I have decided to leave a lot of these objects even though they may not exist
// TODO we'll have to add these over time, the ones that make sense
// TODO some of these instanceof checks might break
// TODO some of those objects might not exist in QuickJS/wasmedge-quickjs
async function prepareRequestBody(
    init: RequestInit | undefined
): Promise<[Uint8Array] | []> {
    if (init === undefined) {
        return [];
    }

    if (init.body === null) {
        return [];
    }

    if (init.body === undefined) {
        return [];
    }

    if (typeof init.body === 'string') {
        const textEncoder = new TextEncoder();
        return [textEncoder.encode(init.body)];
    }

    if (
        init.body instanceof ArrayBuffer ||
        init.body instanceof Uint8Array ||
        init.body instanceof Uint8ClampedArray ||
        init.body instanceof Uint16Array ||
        init.body instanceof Uint32Array ||
        init.body instanceof BigUint64Array ||
        init.body instanceof Int8Array ||
        init.body instanceof Int16Array ||
        init.body instanceof Int32Array ||
        init.body instanceof BigInt64Array ||
        init.body instanceof Float32Array ||
        init.body instanceof Float64Array
    ) {
        return [new Uint8Array(init.body)];
    }

    if (init.body instanceof DataView) {
        return [new Uint8Array(init.body.buffer)];
    }

    if (init.body instanceof Blob) {
        return [new Uint8Array(await init.body.arrayBuffer())];
    }

    if (init.body instanceof File) {
        const blob = new Blob([init.body], { type: init.body.type });
        const buffer = await blob.arrayBuffer();
        return [new Uint8Array(buffer)];
    }

    if (init.body instanceof URLSearchParams) {
        const encoder = new TextEncoder();
        return [encoder.encode(init.body.toString())];
    }

    if (init.body instanceof FormData) {
        throw new Error(`azleFetch: FormData is not a supported body type`);
    }

    throw new Error(`azleFetch: Not a supported body type`);
}

function getHeaders(init: RequestInit | undefined): [string, string][] {
    if (init === undefined) {
        return [];
    }

    if (Array.isArray(init.headers)) {
        return init.headers;
    }

    if (typeof init.headers === 'object') {
        return Object.entries(init.headers);
    }

    // TODO we do not currently have a Headers object
    // if (init.headers instanceof Headers) {
    //     throw new Error(`azleFetch: Headers is not a supported headers type`);
    // }

    throw new Error(`azleFetch: not a supported headers type`);
}
