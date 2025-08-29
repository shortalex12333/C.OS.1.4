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
    
    // Parse attachment information
    const attachments = [];
    if (email.has_attachments && email.attachment_names) {
      try {
        const names = Array.isArray(email.attachment_names) ? email.attachment_names : JSON.parse(email.attachment_names || '[]');
        const types = Array.isArray(email.attachment_types) ? email.attachment_types : JSON.parse(email.attachment_types || '[]');
        const sizes = Array.isArray(email.attachment_sizes) ? email.attachment_sizes : JSON.parse(email.attachment_sizes || '[]');
        
        for (let i = 0; i < names.length; i++) {
          attachments.push({
            name: names[i] || `Attachment ${i+1}`,
            type: types[i] || 'application/octet-stream',
            size: sizes[i] || 'Unknown size'
          });
        }
      } catch (e) {
        // Fallback if parsing fails
        if (email.attachment_count > 0) {
          for (let i = 0; i < email.attachment_count; i++) {
            attachments.push({
              name: `Document ${i+1}`,
              type: 'application/pdf',
              size: 'Unknown size'
            });
          }
        }
      }
    }
    
    // Calculate total attachment size display
    const getTotalAttachmentSize = () => {
      if (!email.has_attachments || email.attachment_count === 0) return '';
      
      // Try to get actual total size if available
      if (email.attachment_sizes && Array.isArray(email.attachment_sizes)) {
        const totalBytes = email.attachment_sizes.reduce((total, size) => {
          const bytes = parseFloat(size);
          return total + (isNaN(bytes) ? 0 : bytes);
        }, 0);
        
        if (totalBytes > 0) {
          if (totalBytes > 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
          if (totalBytes > 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
          return `${totalBytes} B`;
        }
      }
      
      // Fallback size estimation
      return email.attachment_count > 3 ? '12+ MB' : `${email.attachment_count * 2} MB`;
    };
    
    // Generate HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(email.subject || 'Email')}</title>
    
    <!-- Outlook-style fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #242424;
            background: #f5f5f5;
            padding: 0;
            margin: 0;
        }
        
        .outlook-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        
        .outlook-header {
            background: #ffffff;
            border-bottom: 1px solid #e1dfdd;
            padding: 24px 32px 20px 32px;
        }
        
        .email-subject {
            font-size: 24px;
            font-weight: 700;
            color: #242424;
            margin-bottom: 20px;
            line-height: 1.25;
        }
        
        .sender-info {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .sender-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #0078d4;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .sender-details {
            flex: 1;
        }
        
        .sender-name {
            font-weight: 700;
            color: #242424;
            font-size: 16px;
            margin-bottom: 2px;
        }
        
        .sender-email {
            color: #484644;
            font-size: 14px;
        }
        
        .email-meta-info {
            font-size: 15px;
            color: #484644;
            line-height: 1.5;
        }
        
        .meta-line {
            margin-bottom: 6px;
            font-weight: 400;
        }
        
        .meta-line strong {
            font-weight: 600;
            color: #242424;
        }
        
        .attachments-section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #edebe9;
        }
        
        .attachments-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: #323130;
            font-size: 13px;
        }
        
        .attachment-icon {
            margin-right: 8px;
            color: #605e5c;
        }
        
        .attachment-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .attachment-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: #f3f2f1;
            border: 1px solid #edebe9;
            border-radius: 4px;
            font-size: 12px;
            color: #323130;
            max-width: 250px;
        }
        
        .attachment-item:hover {
            background: #e1dfdd;
            cursor: pointer;
        }
        
        .attachment-icon-small {
            margin-right: 6px;
            color: #605e5c;
        }
        
        .attachment-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
        
        .email-content {
            padding: 32px 32px 40px 32px;
            background: white;
        }
        
        .email-body {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 16px;
            line-height: 1.6;
            color: #242424;
            margin-bottom: 32px;
            font-weight: 400;
        }
        
        .email-signature {
            border-top: 1px solid #e1dfdd;
            padding-top: 20px;
            margin-top: 32px;
            font-size: 15px;
            color: #484644;
            white-space: pre-line;
            font-weight: 400;
        }
        
        .outlook-footer {
            background: #faf9f8;
            padding: 16px 24px;
            border-top: 1px solid #edebe9;
            font-size: 12px;
            color: #605e5c;
        }
        
        .footer-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .timestamp-badge {
            background: #f3f2f1;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #605e5c;
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
    
    <div class="outlook-container">
        <div class="outlook-header">
            <h1 class="email-subject">${escapeHtml(email.subject || 'No Subject')}</h1>
            
            <div class="sender-info">
                <div class="sender-avatar">
                    ${email.sender_name ? escapeHtml(email.sender_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()) : 'U'}
                </div>
                <div class="sender-details">
                    <div class="sender-name">${escapeHtml(email.sender_name || 'Unknown Sender')}</div>
                    <div class="sender-email">&lt;${escapeHtml(email.sender_email || 'no-reply@yacht.com')}&gt;</div>
                </div>
                <div class="timestamp-badge">${formatDate(email.date_sent)}</div>
            </div>
            
            <div class="email-meta-info">
                <div class="meta-line"><strong>To:</strong> ${escapeHtml(email.recipient_email || 'N/A')}</div>
                ${email.cc_emails && email.cc_emails.length > 0 ? `<div class="meta-line"><strong>Cc:</strong> ${email.cc_emails.map(cc => escapeHtml(cc)).join('; ')}</div>` : ''}
                ${email.yacht_name ? `<div class="meta-line"><strong>Yacht:</strong> ${escapeHtml(email.yacht_name)}</div>` : ''}
                ${email.sender_company ? `<div class="meta-line"><strong>Company:</strong> ${escapeHtml(email.sender_company)}</div>` : ''}
            </div>
            
            ${email.has_attachments && attachments.length > 0 ? `
            <div class="attachments-section">
                <div class="attachments-header">
                    <span class="attachment-icon">📎</span>
                    ${attachments.length} attachment${attachments.length > 1 ? 's' : ''} ${getTotalAttachmentSize() ? '(' + getTotalAttachmentSize() + ')' : ''}
                </div>
                <div class="attachment-list">
                    ${attachments.map(att => `
                        <div class="attachment-item">
                            <span class="attachment-icon-small">${att.type.includes('pdf') ? '📄' : att.type.includes('image') ? '🖼️' : '📎'}</span>
                            <span class="attachment-name">${escapeHtml(att.name)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
        
        <div class="email-content">
            <div class="email-body">${escapeHtml(email.body || 'No content available')}</div>
            
            ${email.signature_block ? `
            <div class="email-signature">
                ${escapeHtml(email.signature_block)}
            </div>` : email.sender_name && email.sender_title ? `
            <div class="email-signature">
                ${escapeHtml(email.sender_name)}
                ${email.sender_title ? escapeHtml(email.sender_title) : ''}
                ${email.sender_company ? escapeHtml(email.sender_company) : ''}
            </div>` : ''}
        </div>
        
        <div class="outlook-footer">
            <div class="footer-meta">
                <div>
                    <div>Email ID: ${escapeHtml(email.id)}</div>
                    <div>Retrieved: ${new Date().toLocaleString('en-GB')}</div>
                    ${email.is_read !== null ? `<div>Read Status: ${email.is_read ? 'Read' : 'Unread'}</div>` : ''}
                </div>
                ${email.yacht_name ? `<div class="timestamp-badge">${escapeHtml(email.yacht_name)}</div>` : ''}
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