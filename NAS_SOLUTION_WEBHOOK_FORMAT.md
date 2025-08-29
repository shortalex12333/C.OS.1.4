# EXACT NAS/Yacht Solution Webhook Response Format

## Required Webhook Response Structure

When `search_strategy: 'yacht'`, `'nas'`, `'local'`, or `'both'`, the webhook MUST return this exact JSON format:

```json
[
  {
    "success": true,
    "answer": "Found 2 relevant documents about fault code E-047 related to the main engine. The engine manual indicates that E-047 typically points to a fuel pressure sensor malfunction...",
    "confidence_score": 0.85,
    "ai_summary": "2 procedures: E-047, T-023",
    "solutions": [
      {
        "id": "sol_001",
        "solution_id": "sol_001",
        "title": "MTU Fault Code E-047 - Main Engine Fuel System", 
        "confidence": "high",
        "confidenceScore": 90,
        "description": "Official MTU diagnostic procedure for main engine fuel pressure sensor. Normal operating pressure: 45-50 PSI. Torque specification: 25 Nm.",
        "source": {
          "title": "MTU Service Manual", 
          "page": 47,
          "revision": "Rev 2024.1"
        },
        "source_document": {
          "id": "doc_mtu_12345",
          "fault_code": "E-047",
          "source": "MTU",
          "type": "manual",
          "url": "https://api.celeste7.ai/manual-display/doc_mtu_12345"
        },
        "steps": [
          {
            "text": "Shut down engine and depressurize fuel system safely",
            "type": "warning",
            "isBold": false
          },
          {
            "text": "Locate fuel pressure sensor as per schematics", 
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Disconnect sensor and inspect for damage or corrosion",
            "type": "normal", 
            "isBold": false
          },
          {
            "text": "Test sensor with multimeter - should read 2.5-4.5V",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Replace sensor if readings are out of specification",
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Calibrate new sensor following manufacturer procedure",
            "type": "tip",
            "isBold": false
          },
          {
            "text": "Restart engine and verify fault code clears",
            "type": "normal", 
            "isBold": false
          }
        ],
        "parts_needed": [
          "Part #MTU-FPS-2024 Fuel Pressure Sensor",
          "Part #MTU-GSK-001 Gasket Kit", 
          "Part #MTU-CAL-TOOL Calibration Tool"
        ],
        "estimated_time": "2-4 hours",
        "safety_warnings": [
          "Ensure fuel system is depressurized before disconnecting sensors",
          "Wear appropriate PPE when working with fuel components",
          "Follow lockout/tagout procedures before maintenance"
        ],
        "specifications": {
          "pressure": "45-50 PSI (normal operating)",
          "temperature": "180-195°F (normal operating)",
          "torque": "25 Nm (sensor installation)", 
          "clearance": "0.5mm sensor gap"
        },
        "procedureLink": "https://api.celeste7.ai/manual-display/doc_mtu_12345#page47",
        "original_doc_url": "https://api.celeste7.ai/manual-display/doc_mtu_12345"
      },
      {
        "id": "sol_002",
        "solution_id": "sol_002", 
        "title": "Caterpillar Fault Code T-023 - Temperature Sensor Backup",
        "confidence": "medium",
        "confidenceScore": 75,
        "description": "Caterpillar backup procedure for temperature sensor issues related to fuel system monitoring. Use when primary diagnostics inconclusive.",
        "source": {
          "title": "Caterpillar Engine Manual",
          "page": 156, 
          "revision": "Rev 2023.2"
        },
        "source_document": {
          "id": "doc_cat_67890",
          "fault_code": "T-023", 
          "source": "Caterpillar",
          "type": "manual",
          "url": "https://api.celeste7.ai/manual-display/doc_cat_67890"
        },
        "steps": [
          {
            "text": "Check temperature sensor wiring harness", 
            "type": "normal",
            "isBold": false
          },
          {
            "text": "Verify sensor resistance at operating temperature",
            "type": "normal",
            "isBold": false  
          },
          {
            "text": "Cross-reference with cooling system diagnostics",
            "type": "tip",
            "isBold": false
          }
        ],
        "parts_needed": [
          "Part #CAT-TEMP-456 Temperature Sensor",
          "Part #CAT-WIRE-789 Wiring Harness"
        ], 
        "estimated_time": "1-2 hours",
        "safety_warnings": [
          "Allow engine to cool before sensor removal",
          "Use proper torque specifications to avoid thread damage"
        ],
        "specifications": {
          "temperature": "185-200°F (normal range)",
          "resistance": "2.2-2.8 kΩ at 180°F", 
          "torque": "18 Nm (sensor installation)"
        },
        "procedureLink": "https://api.celeste7.ai/manual-display/doc_cat_67890#page156",
        "original_doc_url": "https://api.celeste7.ai/manual-display/doc_cat_67890"
      }
    ],
    "documents_used": [
      {
        "id": "doc_mtu_12345",
        "fault_code": "E-047", 
        "source": "MTU",
        "type": "manual",
        "url": "https://api.celeste7.ai/manual-display/doc_mtu_12345"
      },
      {
        "id": "doc_cat_67890",
        "fault_code": "T-023",
        "source": "Caterpillar", 
        "type": "manual",
        "url": "https://api.celeste7.ai/manual-display/doc_cat_67890"
      }
    ],
    "sources": ["MTU", "Caterpillar"],
    "references": ["E-047", "T-023"],
    "messageId": "msg_1756407625279",
    "timestamp": "2025-08-28T19:00:25.279Z",
    "metadata": {
      "documents_searched": 2,
      "confidence_calculation": "from_documents",
      "search_strategy": "yacht"
    }
  }
]
```

## Required Fields for Technical Solutions

### Core Solution Metadata (ALL REQUIRED)
```typescript
{
  id: string;                    // Unique identifier "sol_001"
  solution_id: string;           // Same as id for consistency
  title: string;                 // "MTU Fault Code E-047 - Main Engine Fuel System"
  confidence: "high" | "medium" | "low";    // String confidence level
  confidenceScore: number;       // 0-100 percentage for circle badge color
  description: string;           // Overview with key specifications
}
```

### Source Documentation (REQUIRED)
```typescript
{
  source: {
    title: string;               // "MTU Service Manual"
    page?: number;               // 47 (page number)
    revision?: string;           // "Rev 2024.1"
  },
  source_document: {
    id: string;                  // "doc_mtu_12345" 
    fault_code: string;          // "E-047" or "N/A"
    source: string;              // "MTU", "Caterpillar"
    type: string;                // "manual", "bulletin", "procedure"
    url: string;                 // "https://api.celeste7.ai/manual-display/..."
  }
}
```

### Procedure Steps (REQUIRED)
```typescript
{
  steps: Array<{
    text: string;                // "Shut down engine and depressurize fuel system"
    type?: "normal" | "warning" | "tip";  // Controls icon (✓ ⚠️ 💡)
    isBold?: boolean;            // false (true for headers/emphasis)
  }>
}
```

### Technical Details (OPTIONAL - Enhanced Info)
```typescript
{
  parts_needed?: string[];       // ["Part #MTU-FPS-2024 Fuel Pressure Sensor"]
  estimated_time?: string;       // "2-4 hours"
  safety_warnings?: string[];    // ["Ensure fuel system is depressurized..."] 
  specifications?: {             // Technical specs object
    pressure?: string;           // "45-50 PSI (normal operating)"
    temperature?: string;        // "180-195°F (normal operating)"  
    torque?: string;            // "25 Nm (sensor installation)"
    clearance?: string;         // "0.5mm sensor gap"
    resistance?: string;        // "2.2-2.8 kΩ at 180°F"
    voltage?: string;           // "2.5-4.5V (sensor output)"
  },
  procedureLink?: string;       // Link to full procedure document
  original_doc_url?: string;    // Original document URL
}
```

## Step Type Icons & Colors

### Icon Mapping (from AISolutionCard getStepIcon function):
- **`"normal"`** → ✅ CheckCircle (green #10b981)
- **`"warning"`** → ⚠️ AlertTriangle (amber #f59e0b) 
- **`"tip"`** → 💡 Info (blue #3b82f6)

### Step Text Styling:
- **Font**: `Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Size**: `15px` mobile, `16px` desktop
- **Line Height**: `23px` mobile, `25px` desktop  
- **Weight**: `500` (regular), `600` (bold headers)
- **Letter Spacing**: `-0.01em`

## Confidence Badge System

### Confidence Score to Color Mapping:
- **≥75%**: High (Green gradient) `#059669 → #047857`
- **≥50%**: Medium (Amber gradient) `#d97706 → #b45309` 
- **<50%**: Low (Red gradient) `#dc2626 → #b91c1c`

### Circle Badge Specifications:
- **Size**: 24px mobile, 28px desktop
- **Shape**: Perfect circle with gradient background
- **Shadow**: `0 3px 12px rgba(color, 0.25)` + inset highlight
- **Hover**: `scale(1.1)` transform
- **Active**: `scale(0.95)` transform

## Additional Details Sections

### Parts Needed Format:
```json
"parts_needed": [
  "Part #MTU-FPS-2024 Fuel Pressure Sensor",
  "Part #MTU-GSK-001 Gasket Kit",
  "Part #CAT-WIRE-789 Wiring Harness"
]
```

### Safety Warnings Format:
```json  
"safety_warnings": [
  "Ensure fuel system is depressurized before disconnecting sensors",
  "Wear appropriate PPE when working with fuel components",
  "Follow lockout/tagout procedures before maintenance"
]
```

### Technical Specifications Format:
```json
"specifications": {
  "pressure": "45-50 PSI (normal operating)",
  "temperature": "180-195°F (normal operating)", 
  "torque": "25 Nm (sensor installation)",
  "clearance": "0.5mm sensor gap",
  "resistance": "2.2-2.8 kΩ at 180°F",
  "voltage": "2.5-4.5V (sensor output)"
}
```

## Response Metadata (REQUIRED)

```json
"metadata": {
  "documents_searched": 2,                    // Number of documents found
  "confidence_calculation": "from_documents", // How confidence was calculated
  "search_strategy": "yacht"                  // CRITICAL: Triggers AISolutionCard
}
```

## Critical Requirements

1. **Array Wrapper**: Response MUST be wrapped in array `[{...}]`
2. **Search Strategy**: `metadata.search_strategy` MUST be `"yacht"`, `"nas"`, `"local"`, or `"both"` 
3. **Landscape Layout**: Technical cards use full width (landscape orientation)
4. **Steps Array**: Always include steps array with proper type/isBold flags
5. **Source Documentation**: Required for procedure links and source attribution
6. **Confidence Fields**: Both string (`confidence`) and numeric (`confidenceScore`) required
7. **Technical Focus**: Emphasize diagnostic procedures, parts, specifications, safety

## NAS vs Email Solution Differences

**NAS/Yacht Solutions Focus On:**
- Technical diagnostic procedures (step-by-step instructions)
- Equipment specifications (pressures, temperatures, torque values)
- Parts lists and procurement information
- Safety warnings and technical documentation
- Manufacturer service manual references

**Email Solutions Focus On:**
- Communication metadata (sender, company, thread context)
- Email content (subject, body, attachments)
- Correspondence relevance (AI summary of email value)

## Webhook Processing Flow

1. **Request**: Contains `search_strategy: 'yacht'` (or nas/local/both)
2. **Processing**: Search technical documentation database for procedures
3. **Response**: Return array with technical solution format  
4. **Frontend**: Detects `search_strategy !== 'email'` → renders `AISolutionCard`
5. **Display**: Landscape cards show diagnostic procedures + technical specifications

## Document URL Requirements

- **procedureLink**: Direct link to procedure section `"https://api.celeste7.ai/manual-display/doc_id#page47"`
- **original_doc_url**: Link to full document `"https://api.celeste7.ai/manual-display/doc_id"`
- **source_document.url**: Same as original_doc_url for consistency

All document URLs must be accessible and properly formatted for external link functionality.