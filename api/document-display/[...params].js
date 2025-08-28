import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table configuration mapping
const TABLE_CONFIGS = {
  'yacht_emails': {
    tableName: 'yacht_emails',
    titleField: 'subject',
    contentField: 'body',
    senderField: 'sender_name',
    senderEmailField: 'sender_email',
    recipientField: 'recipient_email',
    dateField: 'date_sent',
    yachtField: 'yacht_name',
    priorityField: 'priority',
    statusField: 'status',
    departmentField: 'department',
    typeField: 'email_type',
    documentType: 'email'
  },
  'yacht_manuals': {
    tableName: 'yacht_manuals',
    titleField: 'title',
    contentField: 'description',
    authorField: 'author',
    dateField: 'created_at',
    yachtField: 'yacht_name',
    categoryField: 'category',
    versionField: 'version',
    statusField: 'status',
    documentType: 'manual'
  },
  'yacht_documents': {
    tableName: 'yacht_documents',
    titleField: 'name',
    contentField: 'description',
    authorField: 'uploaded_by',
    dateField: 'upload_date',
    yachtField: 'vessel_name',
    categoryField: 'document_type',
    statusField: 'status',
    documentType: 'document'
  },
  'manuals': {
    tableName: 'manuals',
    titleField: 'title',
    contentField: 'content',
    authorField: 'author',
    dateField: 'created_at',
    categoryField: 'category',
    statusField: 'status',
    documentType: 'manual'
  },
  'documents': {
    tableName: 'documents',
    titleField: 'title',
    contentField: 'content',
    authorField: 'author',
    dateField: 'created_at',
    categoryField: 'category',
    statusField: 'status',
    documentType: 'document'
  },
  // Add more table configs as needed
};

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
    // Parse URL parameters: /api/document-display/[table]/[id]
    const { params } = req.query;
    
    if (!params || params.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid URL format. Use: /api/document-display/[table]/[id]',
        example: '/api/document-display/yacht_emails/12345678-1234-1234-1234-123456789abc'
      });
    }
    
    const [tableName, documentId, ...extraParams] = params;
    
    if (!tableName || !documentId) {
      return res.status(400).json({ error: 'Table name and document ID are required' });
    }
    
    // Get table configuration
    const config = TABLE_CONFIGS[tableName];
    if (!config) {
      return res.status(400).json({ 
        error: `Unsupported table: ${tableName}`,
        supportedTables: Object.keys(TABLE_CONFIGS)
      });
    }
    
    // Check if PDF export is requested
    const isPdfExport = req.query.export === 'pdf';
    
    // Fetch document from Supabase
    const { data: document, error } = await supabase
      .from(config.tableName)
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error || !document) {
      return res.status(404).json({ 
        error: 'Document not found',
        table: tableName,
        id: documentId,
        details: error?.message 
      });
    }
    
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
    
    // Get document values based on config
    const getFieldValue = (fieldName) => {
      return fieldName ? document[fieldName] : null;
    };
    
    const title = getFieldValue(config.titleField);
    const content = getFieldValue(config.contentField);
    const author = getFieldValue(config.authorField || config.senderField);
    const authorEmail = getFieldValue(config.senderEmailField);
    const recipient = getFieldValue(config.recipientField);
    const date = getFieldValue(config.dateField);
    const yacht = getFieldValue(config.yachtField);
    const priority = getFieldValue(config.priorityField);
    const status = getFieldValue(config.statusField);
    const department = getFieldValue(config.departmentField);
    const category = getFieldValue(config.categoryField || config.typeField);
    const version = getFieldValue(config.versionField);
    const documentType = config.documentType;
    
    // Generate appropriate header gradient based on document type
    const getHeaderGradient = () => {
      switch (documentType) {
        case 'email':
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        case 'manual':
          return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        case 'document':
          return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        default:
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    };
    
    // Generate HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title || 'Document')}</title>
    
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
        
        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            overflow: hidden;
        }
        
        .document-header {
            background: ${getHeaderGradient()};
            color: white;
            padding: 32px;
        }
        
        .document-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .document-type-badge {
            display: inline-block;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .document-meta {
            font-size: 14px;
            opacity: 0.95;
        }
        
        .meta-row {
            display: flex;
            padding: 6px 0;
        }
        
        .meta-label {
            font-weight: 500;
            min-width: 100px;
        }
        
        .meta-value {
            opacity: 0.9;
        }
        
        .document-tags {
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
        
        .document-body {
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
        
        .document-footer {
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
            background: ${getHeaderGradient()};
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
            
            .document-container {
                box-shadow: none;
                max-width: 100%;
            }
            
            .document-header {
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
    
    <div class="document-container">
        <div class="document-header">
            <div class="document-type-badge">${escapeHtml(documentType)}</div>
            <h1 class="document-title">${escapeHtml(title || 'No Title')}</h1>
            
            <div class="document-meta">
                ${author ? `
                <div class="meta-row">
                    <span class="meta-label">${documentType === 'email' ? 'From:' : 'Author:'}</span>
                    <span class="meta-value">${escapeHtml(author)}${authorEmail ? ` &lt;${escapeHtml(authorEmail)}&gt;` : ''}</span>
                </div>` : ''}
                ${recipient ? `
                <div class="meta-row">
                    <span class="meta-label">To:</span>
                    <span class="meta-value">${escapeHtml(recipient)}</span>
                </div>` : ''}
                ${date ? `
                <div class="meta-row">
                    <span class="meta-label">Date:</span>
                    <span class="meta-value">${formatDate(date)}</span>
                </div>` : ''}
                ${yacht ? `
                <div class="meta-row">
                    <span class="meta-label">Yacht:</span>
                    <span class="meta-value">${escapeHtml(yacht)}</span>
                </div>` : ''}
                ${version ? `
                <div class="meta-row">
                    <span class="meta-label">Version:</span>
                    <span class="meta-value">${escapeHtml(version)}</span>
                </div>` : ''}
            </div>
            
            ${(priority || status || department || category) ? `
            <div class="document-tags">
                ${priority ? `<span class="tag priority-${priority}">${escapeHtml(priority).toUpperCase()}</span>` : ''}
                ${status ? `<span class="tag status-${status.replace(/\\s+/g, '_')}">${escapeHtml(status)}</span>` : ''}
                ${department ? `<span class="tag">${escapeHtml(department)}</span>` : ''}
                ${category ? `<span class="tag">${escapeHtml(category)}</span>` : ''}
            </div>` : ''}
        </div>
        
        <div class="document-body">
            <div class="body-content">${escapeHtml(content || 'No content available')}</div>
        </div>
        
        <div class="document-footer">
            <div class="footer-info">
                <div>
                    <div>Document ID: ${escapeHtml(documentId)}</div>
                    <div>Retrieved: ${new Date().toLocaleString('en-GB')}</div>
                    <div>Table: ${escapeHtml(tableName)}</div>
                </div>
                ${yacht ? `<div class="yacht-badge">${escapeHtml(yacht)}</div>` : ''}
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
    console.error('Error in document-display API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}