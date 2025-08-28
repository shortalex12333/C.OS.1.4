import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get email ID from URL parameter
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Email ID is required' });
    }
    
    // Fetch email from Supabase
    const { data: email, error } = await supabase
      .from('yacht_emails')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !email) {
      return res.status(404).json({ 
        error: 'Email not found',
        details: error?.message 
      });
    }
    
    // Check if PDF export is requested
    const isPdfExport = req.query.export === 'pdf';
    
    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateString;
      }
    };
    
    // HTML escaping helper
    const escapeHtml = (text) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // Generate HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(email.subject || 'Email')}</title>
    
    <!-- External fonts can be loaded without restrictions -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .email-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 32px;
        }
        
        .email-subject {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .email-meta {
            font-size: 14px;
            opacity: 0.95;
        }
        
        .meta-row {
            display: flex;
            padding: 6px 0;
        }
        
        .meta-label {
            font-weight: 500;
            min-width: 80px;
        }
        
        .meta-value {
            opacity: 0.9;
        }
        
        .email-tags {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .tag {
            display: inline-block;
            padding: 6px 14px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .tag.priority-high {
            background: rgba(255, 107, 107, 0.3);
            border-color: rgba(255, 107, 107, 0.5);
        }
        
        .tag.priority-critical {
            background: rgba(255, 82, 82, 0.4);
            border-color: rgba(255, 82, 82, 0.6);
        }
        
        .tag.status-resolved {
            background: rgba(76, 175, 80, 0.3);
            border-color: rgba(76, 175, 80, 0.5);
        }
        
        .email-body {
            padding: 32px;
            background: white;
        }
        
        .body-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 15px;
            line-height: 1.8;
            color: #444;
        }
        
        .email-footer {
            background: #f8f9fa;
            padding: 20px 32px;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666;
        }
        
        .footer-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .yacht-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .email-container {
                box-shadow: none;
                max-width: 100%;
            }
            
            .email-header {
                background: #667eea !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
        
        ${isPdfExport ? `
        @media screen {
            .pdf-notice {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                animation: slideIn 0.3s ease;
                z-index: 1000;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        }` : ''}
    </style>
</head>
<body>
    ${isPdfExport ? '<div class="pdf-notice">Press Ctrl/Cmd + P to save as PDF</div>' : ''}
    
    <div class="email-container">
        <div class="email-header">
            <h1 class="email-subject">${escapeHtml(email.subject || 'No Subject')}</h1>
            
            <div class="email-meta">
                <div class="meta-row">
                    <span class="meta-label">From:</span>
                    <span class="meta-value">${escapeHtml(email.sender_name || 'Unknown')} &lt;${escapeHtml(email.sender_email || 'no-reply@yacht.com')}&gt;</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">To:</span>
                    <span class="meta-value">${escapeHtml(email.recipient_email || 'N/A')}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Date:</span>
                    <span class="meta-value">${formatDate(email.date_sent)}</span>
                </div>
                ${email.yacht_name ? `
                <div class="meta-row">
                    <span class="meta-label">Yacht:</span>
                    <span class="meta-value">${escapeHtml(email.yacht_name)}</span>
                </div>` : ''}
            </div>
            
            ${(email.priority || email.status || email.department || email.email_type) ? `
            <div class="email-tags">
                ${email.priority ? `<span class="tag priority-${email.priority}">${escapeHtml(email.priority).toUpperCase()}</span>` : ''}
                ${email.status ? `<span class="tag status-${email.status.replace(/\\s+/g, '_')}">${escapeHtml(email.status)}</span>` : ''}
                ${email.department ? `<span class="tag">${escapeHtml(email.department)}</span>` : ''}
                ${email.email_type ? `<span class="tag">${escapeHtml(email.email_type)}</span>` : ''}
            </div>` : ''}
        </div>
        
        <div class="email-body">
            <div class="body-content">${escapeHtml(email.body || 'No content available')}</div>
        </div>
        
        <div class="email-footer">
            <div class="footer-info">
                <div>
                    <div>Email ID: ${escapeHtml(email.id)}</div>
                    <div>Retrieved: ${new Date().toLocaleString('en-GB')}</div>
                </div>
                ${email.yacht_name ? `<div class="yacht-badge">${escapeHtml(email.yacht_name)}</div>` : ''}
            </div>
        </div>
    </div>
    
    ${isPdfExport ? `
    <script>
        // Auto-trigger print dialog for PDF export
        window.onload = function() {
            setTimeout(() => window.print(), 500);
        }
    </script>` : ''}
</body>
</html>`;
    
    // Send HTML response with proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('Error in email-display API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}