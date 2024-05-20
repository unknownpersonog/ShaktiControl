import fetch, { Headers, Response } from 'node-fetch';

interface Data {
    message?: string;
    error?: string;
    status?: number,
    [key: string]: any;
}

interface RequestResult {
    message?: string;
    data: Data;
    headers: Headers;
    response: Response;
}

const headers: Headers = new Headers({
    'X-Access-Token': process.env.API_KEY as string,
    'Content-Type': 'application/json'
});

async function makeRequest(method: string, endpoint: string, data?: any): Promise<RequestResult | void> {
    if (method === 'GET' && data) {
        return console.log('Error: Data cannot be sent with a GET request');
    }

    if (data) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${process.env.API_ENDPOINT}${endpoint}`, {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : null
    });

    try {
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data: any = await response.json();
            if (response.status === 200) {
                return {message: data.message, data: data, headers: response.headers, response: response}
            }
            else {
                return {message: data.error, data: data, headers: response.headers, response: response}
            }
        } else {
            const text: string = await response.text();
            return {message: text, data: {}, headers: response.headers, response: response}
        }
    } catch (err) {
        return console.log('Internal Server Error (Probably Faulty URL)');
    }
}

export default makeRequest;
