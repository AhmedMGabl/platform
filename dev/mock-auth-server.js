// Quick Mock Authentication Server for Unholy Platform
// This allows testing the frontend without Docker

const http = require('http');

const PORT = 3000;

// Helper to create a JWT-like token (header.payload.signature)
const createToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = Buffer.from('mock-signature').toString('base64');
  return `${header}.${encodedPayload}.${signature}`;
};

const mockResponse = (res, status, data, origin, isRpc = false) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || 'http://localhost:8081',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-timezone, Connection',
    'Access-Control-Allow-Credentials': 'true'
  });
  // RPC responses need to be wrapped in { result: ... }
  const response = isRpc ? { result: data } : data;
  res.end(JSON.stringify(response));
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const origin = req.headers.origin || 'http://localhost:8081';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-timezone, Connection',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
    return;
  }

  // Mock RPC endpoint (handles JSON-RPC style calls)
  if (req.url === '/' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const rpcRequest = JSON.parse(body);
        console.log('RPC call:', rpcRequest.method);

        if (rpcRequest.method === 'loginAsGuest') {
          const token = createToken({
            workspace: 'guest-workspace',
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User'
          });
          mockResponse(res, 200, {
            token: token,
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User',
            confirmed: true
          }, origin, true);
        } else if (rpcRequest.method === 'login') {
          console.log('Login:', rpcRequest.params[0]);
          const email = rpcRequest.params[0] || 'user@example.com';
          const token = createToken({
            workspace: 'user-workspace',
            account: email,
            email: email,
            name: 'Test User'
          });
          mockResponse(res, 200, {
            token: token,
            account: email,
            email: email,
            name: 'Test User',
            confirmed: true
          }, origin, true);
        } else if (rpcRequest.method === 'getProviders') {
          mockResponse(res, 200, [], origin, true);
        } else if (rpcRequest.method === 'getUserWorkspaces') {
          mockResponse(res, 200, [{
            workspace: 'workspace-1',
            workspaceId: 'ws1',
            workspaceName: 'My Workspace',
            url: 'workspace-1',
            lastVisit: Date.now()
          }], origin, true);
        } else if (rpcRequest.method === 'getLoginInfoByToken') {
          const incomingToken = rpcRequest.params[0];
          // If a token is provided, return it back; otherwise create a new one
          const token = incomingToken || createToken({
            workspace: 'guest-workspace',
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User'
          });
          mockResponse(res, 200, {
            token: token,
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User',
            confirmed: true
          }, origin, true);
        } else if (rpcRequest.method === 'isReadOnlyGuest') {
          mockResponse(res, 200, false, origin, true);
        } else if (rpcRequest.method === 'getRegionInfo') {
          mockResponse(res, 200, [{
            region: 'default',
            name: 'Default Region',
            endpoint: 'ws://localhost:3333'
          }], origin, true);
        } else if (rpcRequest.method === 'selectWorkspace') {
          console.log('Select workspace:', rpcRequest.params.workspaceUrl);
          const workspaceId = 'workspace-1';
          const token = createToken({
            workspace: workspaceId,
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User'
          });
          mockResponse(res, 200, {
            workspace: workspaceId,
            workspaceUrl: rpcRequest.params.workspaceUrl || 'workspace-1',
            endpoint: 'ws://localhost:3333',
            token: token,
            email: 'guest@unholy.dev',
            account: 'guest@unholy.dev',
            name: 'Guest User',
            confirmed: true,
            role: 'OWNER'
          }, origin, true);
        } else if (rpcRequest.method === 'getWorkspaceInfo') {
          console.log('Get workspace info:', rpcRequest.params);
          mockResponse(res, 200, {
            workspace: 'workspace-1',
            workspaceUrl: 'workspace-1',
            workspaceName: 'My Workspace',
            creating: false,
            disabled: false,
            version: '0.7.0'
          }, origin, true);
        } else if (rpcRequest.method === 'createWorkspace') {
          console.log('Create workspace:', rpcRequest.params.workspaceName);
          const workspaceUrl = rpcRequest.params.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const workspaceId = 'workspace-' + Date.now();
          const token = createToken({
            workspace: workspaceId,
            account: 'guest@unholy.dev',
            email: 'guest@unholy.dev',
            name: 'Guest User'
          });
          mockResponse(res, 200, {
            workspace: workspaceId,
            workspaceUrl: workspaceUrl,
            endpoint: 'ws://localhost:3333',
            token: token,
            email: 'guest@unholy.dev',
            account: 'guest@unholy.dev',
            name: 'Guest User',
            confirmed: true,
            role: 'OWNER'
          }, origin, true);
        } else {
          mockResponse(res, 200, { success: true }, origin, true);
        }
      } catch (e) {
        mockResponse(res, 400, { error: 'Invalid RPC request' }, origin);
      }
    });
    return;
  }

  // Mock guest login endpoint
  if (req.url === '/account/guest' && req.method === 'POST') {
    console.log('Guest login attempt');
    mockResponse(res, 200, {
      token: 'guest-token-' + Date.now(),
      account: 'guest@unholy.dev',
      email: 'guest@unholy.dev',
      name: 'Guest User'
    }, origin);
    return;
  }

  // Mock login endpoint
  if (req.url === '/account/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login attempt:', data.email);

        // Mock successful login
        mockResponse(res, 200, {
          token: 'mock-token-' + Date.now(),
          account: data.email || 'user@example.com',
          email: data.email || 'user@example.com',
          name: 'Test User'
        }, origin);
      } catch (e) {
        mockResponse(res, 400, { error: 'Invalid request' }, origin);
      }
    });
    return;
  }

  // Mock providers endpoint
  if (req.url === '/providers' && req.method === 'GET') {
    console.log('Providers request');
    mockResponse(res, 200, [], origin);
    return;
  }

  // Mock workspace list
  if (req.url === '/account/workspaces' || req.url.startsWith('/account/workspaces')) {
    mockResponse(res, 200, {
      workspaces: [
        {
          workspace: 'workspace-1',
          workspaceId: 'ws1',
          workspaceName: 'My Workspace',
          workspaceUrl: 'ws://localhost:3333'
        }
      ]
    }, origin);
    return;
  }

  // Mock account info
  if (req.url.startsWith('/account/') && req.method === 'GET') {
    mockResponse(res, 200, {
      email: 'user@example.com',
      confirmed: true
    }, origin);
    return;
  }

  // Mock cookie endpoint
  if (req.url === '/cookie' && req.method === 'PUT') {
    console.log('Set cookie request');
    mockResponse(res, 200, { success: true }, origin);
    return;
  }

  // Mock cookie delete endpoint
  if (req.url === '/cookie' && req.method === 'DELETE') {
    console.log('Delete cookie request');
    mockResponse(res, 200, { success: true }, origin);
    return;
  }

  // Default response
  mockResponse(res, 404, { error: 'Not found', url: req.url }, origin);
});

server.listen(PORT, () => {
  console.log('\n=== Mock Authentication Server Started ===');
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log('\nThis is a mock server for testing the Unholy UI.');
  console.log('It will accept any login credentials.');
  console.log('\nPress Ctrl+C to stop\n');
});
