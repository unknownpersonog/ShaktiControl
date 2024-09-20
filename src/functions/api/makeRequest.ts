import axios, { AxiosResponse, AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

interface Data {
    message?: string;
    error?: string;
    status?: number;
    [key: string]: any;
}

interface RequestResult {
    message: string;
    data: Data;
    headers: Record<string, string>;
    status: number;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function convertHeaders(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
            result[key] = value;
        } else if (Array.isArray(value)) {
            result[key] = value.join(', ');
        }
    }
    return result;
}

export async function makeRequest(
    method: HttpMethod,
    endpoint: string,
    data?: any
): Promise<RequestResult> {
    const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        headers: {
            'X-Access-Token': process.env.API_KEY as string,
            'Content-Type': 'application/json',
        },
        data: (method === 'POST' || method === 'PUT') ? data : undefined,
        params: (method === 'GET' || method === 'DELETE') ? data : undefined,
    };

    try {
        const response: AxiosResponse<Data> = await axios(config);

        return {
            message: response.data.message || 'Request was successful',
            data: response.data,
            headers: convertHeaders(response.headers),
            status: response.status,
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return {
                message: error.response.data.error || 'Request failed',
                data: error.response.data,
                headers: convertHeaders(error.response.headers),
                status: error.response.status,
            };
        } else if (axios.isAxiosError(error) && error.request) {
            console.error('Error making request: No response received', error.request);
            return {
                message: 'No response received from server',
                data: {},
                headers: {},
                status: 0,
            };
        } else {
            console.error('Error making request:', error);
            return {
                message: 'Internal Server Error',
                data: {},
                headers: {},
                status: 500,
            };
        }
    }
}