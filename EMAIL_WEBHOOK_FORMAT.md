# EXACT Email Webhook Response Format

## Required Webhook Response Structure

When `search_strategy: 'email'` or `'email-yacht'`, the webhook MUST return this exact JSON format:

```json
[
  {
    "success": true,
    "answer": "I found 3 relevant emails about fuel pressure sensor issues from MTU engineers and service teams...",
    "confidence_score": 0.85,
    "ai_summary": "Found MTU service correspondence with official E-047 diagnostic procedures and vendor recommendations",
    "solutions": [
      {
        "id": "email_001",
        "solution_id": "email_001", 
        "company": "MTU Engines",
        "sender": "Mark Thompson",
        "receiver": "Engineering Team",
        "date_sent": "Aug 27, 2025",
        "profile_picture": null,
        "subject_line": "Re: Fuel pressure sensor E-047 fault code",
        "body_text": "Hi team, regarding the E-047 fault you reported yesterday - this typically indicates a fuel pressure sensor malfunction. I've attached the diagnostic procedure from our latest service bulletin. The sensor should be reading between 45-50 PSI at idle. If readings are outside this range, replacement is recommended. Follow the attached calibration procedure after installation.",
        "ai_summary": "Email confirms E-047 is fuel pressure sensor issue. Provides official diagnostic procedure and recommends sensor replacement with specific pressure ranges and calibration steps.",
        "attachment_name": "E-047_Diagnostic_Procedure.pdf",
        "attachment_icon_type": "pdf",
        "thread_count": 3,
        "confidence": "high",
        "confidenceScore": 90,
        "email_url": "https://api.celeste7.ai/email-display/abc123"
      },
      {
        "id": "email_002",
        "solution_id": "email_002",
        "company": "Caterpillar Marine", 
        "sender": "Carlos Alvarez",
        "receiver": "Chief Engineer",
        "date_sent": "Aug 26, 2025", 
        "profile_picture": null,
        "subject_line": "Service Bulletin: C32 Engine Temperature Issues",
        "body_text": "We've issued a new service bulletin regarding temperature regulation on C32 engines. The issue affects serial numbers 5000-6500 manufactured between 2023-2024. Updated thermostat replacement procedure is attached along with revised temperature thresholds.",
        "ai_summary": "Official service bulletin addresses temperature regulation problems in specific C32 engine serial range. Includes updated thermostat replacement procedure and revised temperature specifications.",
        "attachment_name": "Service_Bulletin_2025_08.xlsx",
        "attachment_icon_type": "xlsx", 
        "thread_count": 1,
        "confidence": "high",
        "confidenceScore": 88,
        "email_url": "https://api.celeste7.ai/email-display/def456"
      },
      {
        "id": "email_003", 
        "solution_id": "email_003",
        "company": "M/Y SERENITY",
        "sender": "James Sullivan", 
        "receiver": "All Engineering",
        "date_sent": "Aug 25, 2025",
        "profile_picture": null,
        "subject_line": "Port generator startup issue resolved",
        "body_text": "Team, wanted to share the solution for the port generator that wouldn't start this morning. Turns out it was a simple fuel pump priming issue. Here's what worked: 1) Opened fuel valve fully, 2) Ran prime cycle 3x, 3) Checked for air bubbles. Generator started immediately after. Documenting this for future reference.",
        "ai_summary": "Engineer shares successful fix for generator startup failure. Solution involved fuel pump priming procedure with step-by-step documentation for future reference.",
        "attachment_name": "fuel_pump_photos.zip",
        "attachment_icon_type": "zip",
        "thread_count": 7, 
        "confidence": "medium",
        "confidenceScore": 75,
        "email_url": "https://api.celeste7.ai/email-display/ghi789"
      }
    ],
    "documents_used": ["E-047_MTU", "Service_Bulletin_CAT", "Generator_Fix_Internal"],
    "sources": ["MTU Engines", "Caterpillar Marine", "M/Y SERENITY"],
    "references": [],
    "messageId": "msg_1756407625279",
    "timestamp": "2025-08-28T19:00:25.279Z",
    "metadata": {
      "documents_searched": 3,
      "confidence_calculation": "from_emails", 
      "search_strategy": "email"
    }
  }
]
```

## Required Fields for Email Solutions

### Core Email Metadata (ALL REQUIRED)
```typescript
{
  id: string;                    // Unique identifier "email_001"
  solution_id: string;           // Same as id for consistency  
  company: string;               // "MTU Engines", "Caterpillar Marine" 
  sender: string;                // "Mark Thompson", "Carlos Alvarez"
  receiver: string;              // "Engineering Team", "Chief Engineer"
  date_sent: string;             // "Aug 27, 2025" (human readable)
  subject_line: string;          // Email subject line
  body_text: string;             // Full email body content
  ai_summary: string;            // AI-generated summary of email relevance
  thread_count: number;          // Number of replies (0 if no thread)
}
```

### Optional Fields
```typescript
{
  profile_picture?: string;      // URL to profile image (null if none)
  attachment_name?: string;      // "file.pdf", "document.xlsx" 
  attachment_icon_type?: string; // "pdf", "xlsx", "zip", "jpg", etc.
  email_url?: string;           // Link to full email view
}
```

### Confidence Fields (REQUIRED - Same as Solution Cards)
```typescript
{
  confidence: "high" | "medium" | "low";  // String confidence level
  confidenceScore: number;                 // 0-100 percentage for circle color
}
```

## Response Metadata (REQUIRED)
```typescript
{
  "search_strategy": "email" | "email-yacht",  // CRITICAL: Triggers EmailSolutionCard
  "confidence_calculation": "from_emails",
  "documents_searched": number
}
```

## Attachment Icon Types
- **pdf**: 📄
- **doc/docx**: 📝  
- **xls/xlsx**: 📊
- **zip**: 📦
- **jpg/png**: 📸
- **default**: 📎

## Critical Requirements

1. **Array Wrapper**: Response MUST be wrapped in array `[{...}]`
2. **Search Strategy**: `metadata.search_strategy` MUST be `"email"` or `"email-yacht"`
3. **Portrait Layout**: Email cards use 380px max width (portrait orientation)
4. **Thread Count**: Always include `thread_count` (use 0 if no replies)
5. **AI Summary**: Required field explaining email relevance to query
6. **Company Field**: Required for proper sender identification
7. **Date Format**: Human-readable format "Aug 27, 2025" preferred over ISO

## Email vs Technical Solution Differences

**Email Solutions Focus On:**
- Communication metadata (sender, company, thread context)
- Email content (subject, body, attachments)  
- Correspondence relevance (AI summary of email value)

**Technical Solutions Focus On:**
- Diagnostic procedures (steps, parts, time estimates)
- Equipment specifications (pressures, temperatures, torque)
- Safety warnings and technical documentation

## Webhook Processing Flow

1. **Request**: Contains `search_strategy: 'email'`
2. **Processing**: Search email database for relevant correspondence  
3. **Response**: Return array with email solution format
4. **Frontend**: Detects `search_strategy === 'email'` → renders `EmailSolutionCard`
5. **Display**: Portrait cards show email metadata + content preview