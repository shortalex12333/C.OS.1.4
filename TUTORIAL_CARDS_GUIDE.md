# CelesteOS Tutorial Cards Guide

## When Tutorial Cards Appear

The tutorial system shows different sets of cards based on user progress through the interface.

## Phase 1: Initial Tutorial (Before First Message)

**Triggers:** When user first logs in and hasn't sent any messages yet

### Step 1: Search Types
- **Highlights:** Sidebar search buttons (New Chat, Yacht Search, Email Search)
- **Purpose:** Explains the difference between search types
- **Message:** "You can search through New Chat for general queries, Yacht Search for technical docs, or Email Search for communications."

### Step 2: Input Area  
- **Highlights:** Main chat input box at bottom
- **Purpose:** Shows where to type questions
- **Message:** "Enter any technical question, fault code, or document request in this search box."

### Step 3: Example Questions
- **Highlights:** Preloaded question cards in center
- **Purpose:** Encourages user to try a sample question
- **Message:** "Click one of these preloaded questions to see how CelesteOS works."
- **Required Action:** User must click a question to continue

## Phase 2: Solution Tutorial (After First AI Response)

**Triggers:** When AI responds with solution cards for the first time

### Step 1: Solution Found
- **Highlights:** Entire solution card
- **Purpose:** Introduces the concept of solution cards
- **Message:** "This is a solution card that contains the answer to your query."

### Step 2: Expand Solution
- **Highlights:** Solution card header (clickable area)
- **Purpose:** Teaches expansion interaction
- **Message:** "Click on the solution card header to expand and see the full answer."
- **Required Action:** User must click to expand solution

### Step 3: Solution Title
- **Highlights:** Solution title and confidence circle
- **Purpose:** Explains confidence scoring
- **Message:** "This shows the title and confidence score of the solution."

### Step 4: Source Document
- **Highlights:** Source document chip (shows manual reference)
- **Purpose:** Explains document attribution
- **Message:** "This chip shows which manual or document contains this answer."

### Step 5: Detailed Steps
- **Highlights:** Step-by-step procedure list
- **Purpose:** Shows main content area
- **Message:** "Here are the detailed steps or information from the source document."

### Step 6: Rate This Answer
- **Highlights:** Thumbs up/down feedback buttons
- **Purpose:** Teaches feedback system
- **Message:** "Use these thumbs up/down buttons to rate how helpful this answer was."

### Step 7: Leave Detailed Feedback
- **Highlights:** "Leave Feedback" button
- **Purpose:** Shows detailed feedback option
- **Message:** "Click here to provide specific feedback about this answer."
- **Required Action:** User must click to open feedback form

### Step 8: Type Feedback
- **Highlights:** Feedback text area (when expanded)
- **Purpose:** Teaches feedback input
- **Message:** "Enter your specific feedback to help us improve our responses."
- **Required Action:** User must type feedback

### Step 9: Send Feedback
- **Highlights:** Send feedback button
- **Purpose:** Shows how to submit feedback
- **Message:** "Click here to submit your feedback to our improvement system."
- **Required Action:** User must click send button

### Step 10: Ask More Questions
- **Highlights:** Input box again
- **Purpose:** Encourages continued use
- **Message:** "Now you understand how to use solution cards! Ask any technical question."

## Phase 3: Search Switch Tutorial (After 3rd Message)

**Triggers:** After user has sent 3 messages

### Step 1: Switch Search Source
- **Highlights:** Search type selector buttons in sidebar
- **Purpose:** Teaches switching between NAS and Email search
- **Message:** "Try switching between NAS and Email search using these buttons."

## Phase 4: Export Tutorial (After 5th Message)

**Triggers:** After user has sent 5 messages

### Step 1: Open Settings
- **Highlights:** Settings button in sidebar
- **Purpose:** Shows settings access
- **Message:** "Click here to access settings and export options."
- **Required Action:** User must click Settings

### Step 2: Handover Section
- **Highlights:** Handover section in settings
- **Purpose:** Shows export functionality location
- **Message:** "Navigate to the Handover section to export your findings."

### Step 3: Date Range Selection
- **Highlights:** Date range selector in handover
- **Purpose:** Teaches export date filtering
- **Message:** "Choose 7, 30, 60, or 90 days, or set a custom date range."

## Tutorial Card Appearance

### Visual Design
- **Background:** `rgba(15, 11, 18, 0.95)` (#0f0b12 at 95% opacity)
- **Border:** `rgba(255, 255, 255, 0.08)` (subtle white border)
- **Size:** 360px wide
- **Shape:** 12px border radius
- **Effect:** 16px blur with glassmorphism
- **Shadow:** `0 8px 32px rgba(0, 0, 0, 0.4)`

### Highlight Effect
- **Border:** 2px solid #BADDE9 (CelesteOS blue)
- **Glow:** Pulsing animation with blue glow
- **Background Blur:** Everything else gets 8px blur overlay

### Card Position
Cards position themselves relative to the highlighted element:
- **Right:** Card appears to the right of highlighted element
- **Left:** Card appears to the left of highlighted element  
- **Top:** Card appears above highlighted element
- **Bottom:** Card appears below highlighted element

## Tutorial Control

### Skip Option
Users can skip the tutorial at any time by clicking the X button or clicking outside the highlighted area.

### Progress Tracking
Tutorial tracks user progress and remembers which phase they're in, so it doesn't repeat completed sections.

### Required Actions
Some steps require user interaction (marked with "Required Action") before the tutorial can continue to the next step.