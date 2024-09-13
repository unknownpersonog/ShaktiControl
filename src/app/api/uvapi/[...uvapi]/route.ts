import type { NextRequest } from 'next/server';
import { auth } from '../../../../../auth'; // Adjust the import based on your setup
import type { Session } from 'next-auth';

const API_BASE_URL = process.env.API_ENDPOINT;

async function checkAdmin(session: Session): Promise<boolean> {
    const userInfo = await proxyRequest(`/users/info/${session.user?.email}`, 'GET', undefined, session);
    return userInfo.data.admin === 'true';
}

async function proxyRequest(url: string, method: string, body?: any, session?: Session) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
            'X-Access-Token': process.env.API_KEY as string,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();
    return { status: response.status, data: result };
}

async function handleRequest(req: NextRequest, method: 'GET' | 'POST' | 'PUT') {
    const url = new URL(req.url);
    const session = await auth();

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const discordId = session.user.email;
    let apiUrl = '';
    let requestBody: any = method !== 'GET' ? await req.json() : undefined;

    // Routes split by requirements
    const routesNoAuthCheck = {
        '/api/uvapi/ping': '/ping',
        '/api/uvapi/users/info': `/users/info/${discordId}`,
    } as const;

    const routesRequireAdmin = {
        '/api/uvapi/users/list': '/users/list',
        '/api/uvapi/vps/list': '/vps/list',
        '/api/uvapi/vps/add': '/vps/add',
        '/api/uvapi/vps/delete': '/vps/delete',
        '/api/uvapi/users/verify/mail': '/users/verify/mail',
        '/api/uvapi/users/verify/token': '/users/verify/token',
        '/api/uvapi/projects/create': '/projects/create',
        '/api/uvapi/projects/delete': '/projects/delete',
        '/api/uvapi/projects/list': '/projects/list',
    } as const;

    const routesWithEmailCheck = {
        '/api/uvapi/users/create': '/users/create',
        '/api/uvapi/users/delete': '/users/delete',
    } as const;

    const routesPut = {
        '/api/uvapi/vps/edit': `/vps/edit/${url.pathname.split('/').pop()}`,
        '/api/uvapi/users/edit': `/users/edit/${url.pathname.split('/').pop()}`,
    } as const;

    // Find appropriate route
    const routeConfig = Object.keys({
        ...routesNoAuthCheck,
        ...routesRequireAdmin,
        ...routesWithEmailCheck,
        ...routesPut,
    }).find((route) => url.pathname.startsWith(route));

    if (!routeConfig) {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }

    // Determine if route requires admin check
    if (routesRequireAdmin[routeConfig as keyof typeof routesRequireAdmin] || routesPut[routeConfig as keyof typeof routesPut]) {
        if (!(await checkAdmin(session))) {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }
    }

    // Handle routes that require email checks
    if (routesWithEmailCheck[routeConfig as keyof typeof routesWithEmailCheck]) {
        if (!requestBody.email) {
            return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
        }
        if (routeConfig === '/api/uvapi/users/create') {
            requestBody.email = discordId; // Set the email to discordId for the 'create' endpoint
        }
    }

    apiUrl = routesNoAuthCheck[routeConfig as keyof typeof routesNoAuthCheck] ||
             routesRequireAdmin[routeConfig as keyof typeof routesRequireAdmin] ||
             routesWithEmailCheck[routeConfig as keyof typeof routesWithEmailCheck] ||
             routesPut[routeConfig as keyof typeof routesPut];

    try {
        const { status, data } = await proxyRequest(apiUrl, method, requestBody, session);
        return new Response(JSON.stringify(data), { status });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
    return handleRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
    return handleRequest(req, 'PUT');
}
