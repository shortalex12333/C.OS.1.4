# CelesteOS FAQ - Hardcoded Questions Database

## Overview
This document contains all the frequently asked questions that are hardcoded into the CelesteOS FAQ page. These questions are displayed on the FAQ interface and serve as the primary knowledge base for user inquiries.

**Source File:** `src/frontend-ux/components/AskAlexPage.tsx`  
**Total Questions:** 12  
**Last Updated:** Based on current codebase analysis

---

## Complete FAQ Questions List

### 1. **Is CelesteOS cloud based?**
**ID:** `cloud`  
**Answer:** "No, CelesteOS is not cloud-based. Everything runs on-premise in your network. Your documents never leave your infrastructure, never get uploaded anywhere. That's by design - I know how sensitive technical documentation can be."

### 2. **How do installs work?**
**ID:** `installs`  
**Answer:** "Installation typically takes 2-4 weeks. We handle document ingestion, system integration, crew training. Most clients see immediate ROI from day one due to faster troubleshooting."

### 3. **Can my crew use it securely?**
**ID:** `security`  
**Answer:** "Absolutely. The interface is designed for engineers, not IT specialists. If your crew can use a search engine, they can use CelesteOS. We provide hands-on training during implementation."

### 4. **What happens if we lose internet?**
**ID:** `internet`  
**Answer:** "CelesteOS works completely offline once installed. No internet required for searches or document access. The only time you need connectivity is for initial setup and updates."

### 5. **How fast is document search?**
**ID:** `search-speed`  
**Answer:** "Sub-second search across all your technical documentation. We index everything - PDFs, manuals, procedures, even handwritten notes. The AI understands technical context, not just keywords."

### 6. **No cloud uploads**
**ID:** `cloud-uploads`  
**Answer:** "Correct - zero cloud uploads. Everything stays on your hardware, under your control. On-premise deployment, read-only system architecture, encrypted document processing."

### 7. **What does CelesteOS cost?**
**ID:** `pricing`  
**Answer:** "Pricing is tailored to vessel size and complexity. Most super yachts see ROI within 6 months through reduced downtime and faster problem resolution. Contact us for a custom quote based on your specific needs."

### 8. **How long does training take?**
**ID:** `training`  
**Answer:** "Basic training takes 2-3 hours for crew members. Advanced training for chief engineers takes about a day. We provide on-site training during installation and remote support afterwards."

### 9. **How are updates handled?**
**ID:** `updates`  
**Answer:** "Updates are delivered quarterly and can be installed offline via USB or when connected to port WiFi. Updates include improved AI models, new features, and expanded technical knowledge bases."

### 10. **What languages are supported?**
**ID:** `languages`  
**Answer:** "CelesteOS supports English, Spanish, Italian, French, and German. The system automatically detects document language and can translate technical terms between languages."

### 11. **What systems does it integrate with?**
**ID:** `compatibility`  
**Answer:** "CelesteOS integrates with most yacht management systems including ISM, PMS, and bridge systems. We support standard formats like PDF, DWG, Excel, and can index scanned documents."

### 12. **How accurate is the AI?**
**ID:** `accuracy`  
**Answer:** "Our AI achieves 95%+ accuracy on technical queries. It's trained specifically on marine engineering documentation and continuously improves through usage patterns. Incorrect answers can be flagged for review."

---

## Question Categories

### **Technical Implementation** (5 questions)
- Is CelesteOS cloud based?
- How do installs work?
- What happens if we lose internet?
- How are updates handled?
- What systems does it integrate with?

### **Security & Privacy** (2 questions)
- Can my crew use it securely?
- No cloud uploads

### **Performance & Capabilities** (3 questions)
- How fast is document search?
- What languages are supported?
- How accurate is the AI?

### **Business & Training** (2 questions)
- What does CelesteOS cost?
- How long does training take?

---

## Search Functionality

The FAQ system includes:
- **Real-time filtering**: Questions filter as users type
- **Content search**: Searches both question titles and answer content
- **Case-insensitive**: Matches regardless of capitalization
- **Expandable answers**: Click to reveal full answers
- **Interactive interface**: Smooth animations and hover effects

## Implementation Notes

### Data Structure
```typescript
interface FAQItem {
  id: string;        // Unique identifier
  question: string;  // Display question
  answer: string;    // Full answer content
}
```

### Search Algorithm
- Filters both `question` and `answer` fields
- Uses `toLowerCase()` for case-insensitive matching
- Real-time filtering with `includes()` method

### UI Features
- Accordion-style expandable items
- Chevron rotation animation
- Color-coded expand/collapse states
- Responsive layout for mobile and desktop

---

## Maintenance Instructions

### To Add New Questions:
1. Open `src/frontend-ux/components/AskAlexPage.tsx`
2. Locate the `faqItems` array (around line 43)
3. Add new object with unique `id`, `question`, and `answer`
4. Update this document with the new question

### To Modify Existing Questions:
1. Find the question by `id` in the `faqItems` array
2. Update the `question` or `answer` field
3. Update this documentation accordingly

### Best Practices:
- Keep questions concise and user-focused
- Provide comprehensive answers
- Use unique, descriptive IDs
- Maintain consistent tone and style
- Test search functionality after changes

---

**Document Generated:** Automated analysis of CelesteOS codebase  
**Format:** Markdown (.md)  
**Location:** `/Users/celeste7/Documents/C.OS.1.4/CelesteOS_FAQ_Questions.md`