import type { NextRequest } from 'next/server';
import { auth } from '../../../../../auth'; // Adjust the import based on your setup
import type { Session } from 'next-auth';

const API_BASE_URL = process.env.API_ENDPOINT;
async function checkAdmin(session: any) {
    const info = await proxyRequest(`/users/info/${session.user.email}`, 'GET', undefined, session)
    if (info.data.admin === 'true') {
        return true
    } else return false
} 
async function proxyRequest(url: string, method: string, body?: any, session?: Session) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
            'X-Access-Token': process.env.API_KEY as string,
            'Content-Type': 'application/json',
            // Add additional headers if needed
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();
    return { status: response.status, data: result };
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const session = await auth();

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    let apiUrl = '';
    const discordId = session.user?.email

    switch (true) {
        case url.pathname === '/api/uvapi/ping':
            apiUrl = '/ping';
            break;
        case url.pathname.startsWith('/api/uvapi/users/info'):
            if (discordId) {
                apiUrl = `/users/info/${discordId}`;
                
            } else {
                return new Response(JSON.stringify({ message: 'Invalid discordId' }), { status: 400 });
            }
            break;
        case url.pathname === '/api/uvapi/users/list':
            if ((await proxyRequest(`/users/info/${discordId}`, 'GET', undefined, session)).data.admin === "true") {
                apiUrl = '/users/list';
            } else return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
            break;
        default:
            return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }

    try {
        const { status, data } = await proxyRequest(apiUrl, 'GET', undefined, session);
        return new Response(JSON.stringify(data), { status });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const body = await req.json();
    const session = await auth();

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const email = session.user?.email; // Assuming the email is used as discordId
    let apiUrl = '';

    switch (true) {
        case url.pathname === '/api/uvapi/users/create':
            if (!(await checkAdmin(session))) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
            apiUrl = '/users/create';
            body.email = email;
            body.method = "Google";
            break;
        case url.pathname === '/api/uvapi/users/delete':
            if (!(await checkAdmin(session))) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
            // Extract the email to delete from the request body
            if (!body.email) {
                return new Response(JSON.stringify({ message: 'Email to delete is required' }), { status: 400 });
            }
            apiUrl = '/users/delete';
            body.email = body.email; // Ensure the email to delete is set in the body
            break;
        case url.pathname === '/api/uvapi/vps/add':
            if (!(await checkAdmin(session))) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
            // Extract the email to delete from the request body
            if (!body.email) {
                return new Response(JSON.stringify({ message: 'Email to delete is required' }), { status: 400 });
            }
            apiUrl = '/vps/add';
            body.email = body.email; // Ensure the email to delete is set in the body
            break;
        case url.pathname === '/api/uvapi/users/verify/mail':
            if (!(await checkAdmin(session))) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
            apiUrl = '/users/verify/mail';
            body.discordId = email; // Add discordId to body if required
            break;
        case url.pathname === '/api/uvapi/users/verify/token':
            if (!(await checkAdmin(session))) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
            apiUrl = '/users/verify/token';
            body.discordId = email; // Add discordId to body if required
            break;

        default:
            return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }

    try {
        const { status, data } = await proxyRequest(apiUrl, 'POST', body, session);
        return new Response(JSON.stringify(data), { status });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
