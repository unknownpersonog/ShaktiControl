interface Data {
    message?: string;
    error?: string;
    status?: number;
    [key: string]: any;
}

interface RequestResult {
    message?: string;
    data: Data;
    headers: Headers;
    response: Response;
}

export async function makeRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<RequestResult | void> {
    const headers = new Headers({
        'X-Access-Token': process.env.API_KEY as string,
        'Content-Type': 'application/json',
    });

    try {
        const response = await fetch(`${endpoint}`, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        const result = (await response.json()) as Data;

        if (response.ok) {
            return {
                message: result.message || 'Request was successful',
                data: result,
                headers: response.headers,
                response: response,
            };
        } else {
            return {
                message: result.error || 'Request failed',
                data: result,
                headers: response.headers,
                response: response,
            };
        }
    } catch (error) {
        console.error('Error making request:', error);
        return {
            message: 'Internal Server Error',
            data: {},
            headers: new Headers(),
            response: {} as Response,
        };
    }
}