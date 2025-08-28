import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://vivovcnaapmcfxxfhzxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdm92Y25hYXBtY2Z4eGZoenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjQ5ODIsImV4cCI6MjA3MTQ0MDk4Mn0.eUICOqJRP_MyVMNJNlZu3Mc-1-jAG6nQE-Oy0k3Yr0E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Try multiple possible table names for manuals
const POSSIBLE_TABLES = [
  'documents_search',    // Primary search table with 16,000+ documents
  'yacht_manuals',
  'manuals', 
  'yacht_manual',
  'manual',
  'technical_manuals',
  'equipment_manuals',
  'vessel_manuals',
  'handover_docs',
  'documentation'
];

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
    // Get manual ID from URL parameter
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Manual ID is required' });
    }
    
    // Check if PDF export is requested
    const isPdfExport = req.query.export === 'pdf';
    
    // Try to find the manual in any of the possible tables
    let manual = null;
    let foundTableName = null;
    
    for (const tableName of POSSIBLE_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();
        
        if (data && !error) {
          manual = data;
          foundTableName = tableName;
          break;
        }
      } catch (tableError) {
        // Table doesn't exist or access denied, continue to next table
        continue;
      }
    }
    
    if (!manual) {
      return res.status(404).json({ 
        error: 'Manual not found',
        id: id,
        searchedTables: POSSIBLE_TABLES,
        details: 'Manual not found in any of the expected tables'
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
    
    // Extract relevant fields (try common field names)
    const title = manual.title || manual.name || manual.subject || manual.doc_name || 'Manual Document';
    const content = manual.content || manual.description || manual.body || manual.text || 'No content available';
    const author = manual.author || manual.created_by || manual.uploaded_by || manual.doc_source || 'Unknown';
    const date = manual.created_at || manual.date_created || manual.updated_at || manual.upload_date;
    const category = manual.category || manual.type || manual.document_type || manual.doc_type;
    const version = manual.version || manual.revision;
    const yacht = manual.yacht_name || manual.vessel_name || manual.yacht;
    const status = manual.status;
    
    // Special handling for documents_search table
    const pageNumber = manual.page_number;
    const equipmentTags = manual.equipment_tags;
    const faultCodes = manual.fault_codes;
    
    // Generate HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    
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
        
        .manual-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            overflow: hidden;
        }
        
        .manual-header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 32px;
        }
        
        .manual-type-badge {
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
        
        .manual-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        
        .manual-meta {
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
        
        .manual-tags {
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
        
        .manual-body {
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
        
        .manual-footer {
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
            
            .manual-container {
                box-shadow: none;
                max-width: 100%;
            }
            
            .manual-header {
                background: #f093fb !important;
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
    
    <div class="manual-container">
        <div class="manual-header">
            <div class="manual-type-badge">Manual</div>
            <h1 class="manual-title">${escapeHtml(title)}</h1>
            
            <div class="manual-meta">
                ${author ? `
                <div class="meta-row">
                    <span class="meta-label">Author:</span>
                    <span class="meta-value">${escapeHtml(author)}</span>
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
                ${pageNumber ? `
                <div class="meta-row">
                    <span class="meta-label">Page:</span>
                    <span class="meta-value">${escapeHtml(pageNumber.toString())}</span>
                </div>` : ''}
            </div>
            
            ${(category || status || equipmentTags || faultCodes) ? `
            <div class="manual-tags">
                ${category ? `<span class="tag">${escapeHtml(category)}</span>` : ''}
                ${status ? `<span class="tag">${escapeHtml(status)}</span>` : ''}
                ${equipmentTags && Array.isArray(equipmentTags) ? equipmentTags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('') : ''}
                ${faultCodes && Array.isArray(faultCodes) && faultCodes.length > 0 ? faultCodes.map(code => `<span class="tag" style="background: rgba(255, 59, 48, 0.3);">Fault: ${escapeHtml(code)}</span>`).join('') : ''}
            </div>` : ''}
        </div>
        
        <div class="manual-body">
            <div class="body-content">${escapeHtml(content)}</div>
        </div>
        
        <div class="manual-footer">
            <div class="footer-info">
                <div>
                    <div>Manual ID: ${escapeHtml(id)}</div>
                    <div>Retrieved: ${new Date().toLocaleString('en-GB')}</div>
                    <div>Source Table: ${escapeHtml(foundTableName)}</div>
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
    console.error('Error in manual-display API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}