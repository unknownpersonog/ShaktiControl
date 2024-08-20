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

// Ping API
export async function pingAPI(): Promise<RequestResult | void> {
    return makeRequest('GET', '/ping');
}

// Create User
interface CreateUserParams {
    email: string;
    discordId: string;
}

export async function createUser(params: CreateUserParams): Promise<RequestResult | void> {
    return makeRequest('POST', '/users/create', params);
}

// Verify User by Email
interface VerifyUserByEmailParams {
    email: string;
    discordId: string;
}

export async function verifyUserByEmail(params: VerifyUserByEmailParams): Promise<RequestResult | void> {
    return makeRequest('POST', '/users/verify/mail', params);
}

// Verify User by Token
interface VerifyUserByTokenParams {
    token: string;
    discordId: string;
}

export async function verifyUserByToken(params: VerifyUserByTokenParams): Promise<RequestResult | void> {
    return makeRequest('POST', '/users/verify/token', params);
}

// Get User Info
export async function getUserInfo(discordId: string): Promise<RequestResult | void> {
    return makeRequest('GET', `/users/info/${discordId}`);
}
