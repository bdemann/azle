import {
    call,
    candidEncode,
    id,
    IDL,
    Principal,
    query,
    replyRaw,
    update
} from 'azle';
import {
    HttpRequestArgs,
    HttpResponse,
    HttpTransformArgs
} from 'azle/canisters/management';

export default class {
    @update([], IDL.Text)
    async xkcd(): Promise<string> {
        const httpResponse = await call('aaaaa-aa', 'http_request', {
            paramIdls: [HttpRequestArgs],
            returnIdl: HttpResponse,
            args: [
                {
                    url: `https://xkcd.com/642/info.0.json`,
                    max_response_bytes: [2_000n],
                    method: {
                        get: null
                    },
                    headers: [],
                    body: [],
                    transform: [
                        {
                            function: [id(), 'xkcdTransform'] as [
                                Principal,
                                string
                            ],
                            context: Uint8Array.from([])
                        }
                    ]
                }
            ],
            payment: 50_000_000n
        });

        return Buffer.from(httpResponse.body).toString();
    }

    @update([], HttpResponse, { manual: true })
    async xkcdRaw(): Promise<void> {
        const httpResponse = await call(
            Principal.fromText('aaaaa-aa'),
            'http_request',
            {
                raw: candidEncode(`
                    (
                        record {
                            url = "https://xkcd.com/642/info.0.json";
                            max_response_bytes = 2_000 : nat64;
                            method = variant { get };
                            headers = vec {};
                            body = null;
                            transform = record { function = func "${id().toString()}".xkcdTransform; context = vec {} };
                        }
                    )
                `),
                payment: 50_000_000n
            }
        );

        replyRaw(httpResponse);
    }

    @query([HttpTransformArgs], HttpResponse)
    xkcdTransform(args: HttpTransformArgs): HttpResponse {
        return {
            ...args.response,
            headers: []
        };
    }
}