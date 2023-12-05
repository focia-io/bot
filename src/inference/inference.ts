import { post } from '@focia/utils'

export class Inference {
    private endpioint: string
    private key: string

    constructor(endpoint: string, key: string) {
        this.endpioint = endpoint
        this.key = key
    }

    private async api<T>(data: string, procedure: string) {
        return await post<T>(`${this.endpioint}/${procedure}`, {
            headers: {
                'x-api-key': this.key,
            },
            body: data,
        })
    }

    public async compare(urls: string[]) {
        try {
            const response = await this.api<{ statusCode: number; body: { results: { url: string; score: number }[] } }>(
                JSON.stringify({
                    procedure: 'compare',
                    input: {
                        images: urls,
                    },
                }),
                'focia-compare',
            )
            return response.body.results
        } catch (error) {
            return []
        }
    }
}
