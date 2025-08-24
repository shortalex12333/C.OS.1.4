// Netlify Function - OAuth Callback Handler
// Converted from Flask oauth-callback-server.py

import { Handler } from '@netlify/functions';

// Microsoft OAuth Configuration
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || '41f6dc82-8127-4330-97e0-c6b26e6aa967';
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || '073af86c-74f3-422b-ad5c-a35d41fce4be';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

interface UserInfo {
  displayName: string;
  mail?: string;
  userPrincipalName: string;
  id: string;
}

// Success page template (same as Vercel version)
const getSuccessPage = (userEmail: string, displayName: string, userId: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Email Connected Successfully</title>
    <style>
        :root {
            --bg-primary: #f8faff;
            --bg-secondary: #ffffff;
            --bg-tertiary: #f8f9fa;
            --border-color: #e1e5e9;
            --border-secondary: #e9ecef;
            --text-primary: #212529;
            --text-secondary: #6c757d;
            --text-muted: #adb5bd;
            --accent-color: #0d6efd;
            --accent-hover: #0b5ed7;
            --shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #0f0b12;
                --bg-secondary: #1a1625;
                --bg-tertiary: #252030;
                --border-color: #3a3344;
                --border-secondary: #3a3344;
                --text-primary: #e8e6f0;
                --text-secondary: #b8b5c3;
                --text-muted: #8b8797;
                --accent-color: #4c9aff;
                --accent-hover: #3b8bff;
                --shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
            }
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: var(--bg-primary);
            color: var(--text-primary);
        }
        .container {
            background: var(--bg-secondary);
            padding: 40px;
            border-radius: 12px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .success-icon { font-size: 64px; margin-bottom: 24px; }
        h1 { color: var(--text-primary); margin-bottom: 16px; font-size: 24px; font-weight: 600; }
        p { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
        .user-info {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-secondary);
            padding: 24px;
            border-radius: 8px;
            margin: 24px 0;
            text-align: left;
        }
        .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-secondary);
            min-height: 40px;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 14px; font-weight: 500; color: var(--text-primary); min-width: 120px; }
        .info-value { font-size: 14px; color: var(--text-secondary); text-align: right; flex: 1; }
        .close-btn {
            background: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 24px;
        }
        .close-btn:hover { background: var(--accent-hover); }
        .auto-close { font-size: 12px; color: var(--text-muted); margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>Email Successfully Connected!</h1>
        <p>Your Microsoft email account has been connected to CelesteOS.</p>
        
        <div class="user-info">
            <div class="info-row">
                <div class="info-label">Connected Account</div>
                <div class="info-value">${userEmail}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Name</div>
                <div class="info-value">${displayName}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Connection ID</div>
                <div class="info-value">${userId}</div>
            </div>
        </div>
        
        <p>You can now close this tab and return to CelesteOS to use email search.</p>
        <button class="close-btn" onclick="window.close()">Close This Tab</button>
        <div class="auto-close">This tab will close automatically in <span id="countdown">5</span> seconds</div>
        
        <script>
            function detectAndApplyTheme() {
                let theme = 'light';
                try {
                    if (window.opener && window.opener.localStorage) {
                        theme = window.opener.localStorage.getItem('appearance') || 'light';
                    }
                } catch (e) {
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        theme = 'dark';
                    }
                }
                document.body.className = \`theme-\${theme}\`;
            }
            
            detectAndApplyTheme();
            
            let countdown = 5;
            const timer = setInterval(() => {
                countdown--;
                document.getElementById('countdown').textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(timer);
                    try {
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth_success',
                                email: '${userEmail}',
                                displayName: '${displayName}',
                                userId: '${userId}'
                            }, '*');
                        }
                    } catch (e) {}
                    window.close();
                }
            }, 1000);
        </script>
    </div>
</body>
</html>
`;

const getErrorPage = (errorMessage: string, errorDetails: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Connection Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f8faff;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        .error-icon { font-size: 64px; color: #ef4444; margin-bottom: 20px; }
        h1 { color: #1f2937; margin-bottom: 16px; }
        .error-details {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ef4444;
        }
        .close-btn {
            background: #6b7280;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">❌</div>
        <h1>Connection Failed</h1>
        <p>There was an error connecting your Microsoft email account.</p>
        <div class="error-details">
            <strong>Error:</strong><br>${errorMessage}<br><br>
            <strong>Details:</strong><br>${errorDetails}
        </div>
        <p>Please try again or contact support if the problem persists.</p>
        <button class="close-btn" onclick="window.close()">Close This Tab</button>
    </div>
</body>
</html>
`;

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/html'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { code, state, error, error_description } = event.queryStringParameters || {};

    if (error) {
      const errorPage = getErrorPage(error, error_description || 'Unknown error');
      return { statusCode: 400, headers, body: errorPage };
    }

    if (!code) {
      const errorPage = getErrorPage(
        'No authorization code received',
        'The OAuth flow did not provide an authorization code'
      );
      return { statusCode: 400, headers, body: errorPage };
    }

    // Exchange authorization code for tokens
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const redirectUri = event.headers.host
      ? \`https://\${event.headers.host}/.netlify/functions/oauth-callback\`
      : 'http://localhost:8888/.netlify/functions/oauth-callback';

    const tokenData = new URLSearchParams({
      client_id: CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email offline_access User.Read IMAP.AccessAsUser.All'
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenData.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      const errorPage = getErrorPage(
        'Token exchange failed',
        \`Status: \${tokenResponse.status}, Response: \${errorText.substring(0, 200)}\`
      );
      return { statusCode: 400, headers, body: errorPage };
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Get user info from Microsoft Graph
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': \`Bearer \${tokens.access_token}\` }
    });

    if (!graphResponse.ok) {
      const errorPage = getErrorPage(
        'Could not retrieve user information',
        \`Microsoft Graph API returned status \${graphResponse.status}\`
      );
      return { statusCode: 400, headers, body: errorPage };
    }

    const userInfo: UserInfo = await graphResponse.json();
    const userEmail = userInfo.mail || userInfo.userPrincipalName;
    const displayName = userInfo.displayName || 'Unknown User';
    const userId = state || \`user_\${Date.now()}\`;

    // Store connection data (you'd save this to a database in production)
    const connectionData = {
      user_id: userId,
      email: userEmail,
      display_name: displayName,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_in: tokens.expires_in,
      connected_at: new Date().toISOString(),
      scopes: tokens.scope.split(' ')
    };

    console.log('OAuth Success:', JSON.stringify(connectionData, null, 2));

    // Return success page
    const successPage = getSuccessPage(userEmail, displayName, userId);
    return { statusCode: 200, headers, body: successPage };

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorPage = getErrorPage(
      'Internal server error',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    return { statusCode: 500, headers, body: errorPage };
  }
};