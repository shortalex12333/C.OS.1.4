export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  priority: number; // 1-10, higher = more important
  relatedTopics: string[];
}

export const faqDatabase: FAQItem[] = [
  // Priority Guided Prompts (Always shown first)
  {
    id: 'fault-code-e047',
    question: 'Fault code E-047 mean on our fuel pump for main engine?',
    answer: "Fault code E-047 indicates low fuel pressure in the main engine's primary fuel pump. This typically occurs when fuel filters are clogged or the fuel pump requires maintenance.",
    keywords: ['fault', 'code', 'E-047', 'e047', 'fuel', 'pump', 'main', 'engine', 'error', 'diagnostic'],
    category: 'Diagnostics',
    priority: 10,
    relatedTopics: ['engine', 'fuel system', 'maintenance']
  },
  {
    id: 'main-engine-service',
    question: 'When was the last time main engine was serviced?',
    answer: "Checking maintenance records for main engine service history. Last service was completed on specified date with full inspection and oil change.",
    keywords: ['last', 'time', 'main', 'engine', 'service', 'serviced', 'maintenance', 'history', 'when'],
    category: 'Maintenance',
    priority: 10,
    relatedTopics: ['engine', 'service records', 'maintenance schedule']
  },
  {
    id: 'guest-bedroom-hvac',
    question: 'Find me guest bedroom six HVAC drawing',
    answer: "Locating HVAC technical drawings for guest bedroom six. Accessing deck plans and ventilation schematics.",
    keywords: ['find', 'guest', 'bedroom', 'six', '6', 'hvac', 'drawing', 'plans', 'ventilation', 'air', 'conditioning'],
    category: 'Technical Drawings',
    priority: 10,
    relatedTopics: ['deck plans', 'HVAC', 'guest accommodations']
  },
  // System & Technical
  {
    id: 'system-cloud',
    question: 'Is CelesteOS cloud based?',
    answer: "No, CelesteOS is not cloud-based. Everything runs on-premise in your network. Your documents never leave your infrastructure, never get uploaded anywhere. That's by design - I know how sensitive technical documentation can be.",
    keywords: ['cloud', 'online', 'internet', 'offline', 'premise', 'local', 'security', 'data'],
    category: 'System',
    priority: 9,
    relatedTopics: ['security', 'installation', 'internet']
  },
  {
    id: 'system-offline',
    question: 'What happens if we lose internet?',
    answer: "CelesteOS works completely offline once installed. No internet required for searches or document access. The only time you need connectivity is for initial setup and updates.",
    keywords: ['offline', 'internet', 'connectivity', 'network', 'connection', 'outage'],
    category: 'System',
    priority: 8,
    relatedTopics: ['system-cloud', 'installation']
  },
  {
    id: 'system-speed',
    question: 'How fast is document search?',
    answer: "Sub-second search across all your technical documentation. We index everything - PDFs, manuals, procedures, even handwritten notes. The AI understands technical context, not just keywords.",
    keywords: ['speed', 'fast', 'search', 'performance', 'quick', 'instant', 'response', 'time'],
    category: 'System',
    priority: 7,
    relatedTopics: ['documents', 'ai']
  },
  {
    id: 'system-accuracy',
    question: 'How accurate is the AI?',
    answer: "Our AI achieves 95%+ accuracy on technical queries. It's trained specifically on marine engineering documentation and continuously improves through usage patterns. Incorrect answers can be flagged for review.",
    keywords: ['accuracy', 'reliable', 'correct', 'ai', 'smart', 'intelligent', 'machine learning'],
    category: 'System',
    priority: 8,
    relatedTopics: ['ai', 'training']
  },
  
  // Installation & Setup
  {
    id: 'install-process',
    question: 'How do installs work?',
    answer: "Installation typically takes 2-4 weeks. We handle document ingestion, system integration, crew training. Most clients see immediate ROI from day one due to faster troubleshooting.",
    keywords: ['install', 'setup', 'installation', 'deployment', 'implementation', 'configure'],
    category: 'Installation',
    priority: 9,
    relatedTopics: ['training', 'documents', 'integration']
  },
  {
    id: 'install-integration',
    question: 'What systems does it integrate with?',
    answer: "CelesteOS integrates with most yacht management systems including ISM, PMS, and bridge systems. We support standard formats like PDF, DWG, Excel, and can index scanned documents.",
    keywords: ['integration', 'systems', 'connect', 'compatibility', 'ism', 'pms', 'bridge', 'formats'],
    category: 'Installation',
    priority: 7,
    relatedTopics: ['documents', 'system']
  },
  {
    id: 'install-updates',
    question: 'How are updates handled?',
    answer: "Updates are delivered quarterly and can be installed offline via USB or when connected to port WiFi. Updates include improved AI models, new features, and expanded technical knowledge bases.",
    keywords: ['updates', 'upgrade', 'maintenance', 'usb', 'wifi', 'quarterly', 'features'],
    category: 'Installation',
    priority: 6,
    relatedTopics: ['system-offline', 'ai']
  },

  // Security & Safety
  {
    id: 'security-crew',
    question: 'Can my crew use it securely?',
    answer: "Absolutely. The interface is designed for engineers, not IT specialists. If your crew can use a search engine, they can use CelesteOS. We provide hands-on training during implementation.",
    keywords: ['security', 'crew', 'safe', 'engineers', 'easy', 'simple', 'user-friendly'],
    category: 'Security',
    priority: 8,
    relatedTopics: ['training', 'interface']
  },
  {
    id: 'security-data',
    question: 'No cloud uploads',
    answer: "Correct - zero cloud uploads. Everything stays on your hardware, under your control. On-premise deployment, read-only system architecture, encrypted document processing.",
    keywords: ['security', 'data', 'privacy', 'uploads', 'hardware', 'encrypted', 'control'],
    category: 'Security',
    priority: 9,
    relatedTopics: ['system-cloud', 'installation']
  },

  // Training & Support
  {
    id: 'training-duration',
    question: 'How long does training take?',
    answer: "Basic training takes 2-3 hours for crew members. Advanced training for chief engineers takes about a day. We provide on-site training during installation and remote support afterwards.",
    keywords: ['training', 'learn', 'education', 'hours', 'crew', 'engineers', 'support', 'onsite'],
    category: 'Training',
    priority: 7,
    relatedTopics: ['install-process', 'security-crew']
  },
  {
    id: 'support-languages',
    question: 'What languages are supported?',
    answer: "CelesteOS supports English, Spanish, Italian, French, and German. The system automatically detects document language and can translate technical terms between languages.",
    keywords: ['languages', 'translation', 'english', 'spanish', 'italian', 'french', 'german', 'multilingual'],
    category: 'Training',
    priority: 6,
    relatedTopics: ['documents', 'international']
  },

  // Business & Pricing
  {
    id: 'business-cost',
    question: 'What does CelesteOS cost?',
    answer: "Pricing is tailored to vessel size and complexity. Most super yachts see ROI within 6 months through reduced downtime and faster problem resolution. Contact us for a custom quote based on your specific needs.",
    keywords: ['cost', 'price', 'pricing', 'money', 'roi', 'investment', 'quote', 'budget'],
    category: 'Business',
    priority: 8,
    relatedTopics: ['contact', 'vessel']
  },
  {
    id: 'business-roi',
    question: 'What is the return on investment?',
    answer: "Most clients see immediate ROI from day one through faster troubleshooting. Typical benefits include 60% reduction in fault diagnosis time, 40% fewer repeat issues, and significantly reduced downtime costs.",
    keywords: ['roi', 'return', 'investment', 'benefits', 'savings', 'efficiency', 'downtime', 'costs'],
    category: 'Business',
    priority: 7,
    relatedTopics: ['business-cost', 'troubleshooting']
  },

  // Yacht Operations
  {
    id: 'yacht-engine',
    question: 'Engine troubleshooting support',
    answer: "CelesteOS provides instant access to engine manuals, fault codes, maintenance procedures, and troubleshooting guides. Simply describe the issue and get step-by-step solutions with relevant diagrams and part numbers.",
    keywords: ['engine', 'motor', 'troubleshooting', 'fault', 'codes', 'maintenance', 'repair', 'mechanical'],
    category: 'Operations',
    priority: 9,
    relatedTopics: ['manuals', 'maintenance']
  },
  {
    id: 'yacht-electrical',
    question: 'Electrical system support',
    answer: "Access comprehensive electrical schematics, wiring diagrams, and troubleshooting procedures. The system can help identify electrical faults, suggest testing procedures, and provide safety protocols.",
    keywords: ['electrical', 'wiring', 'circuits', 'power', 'schematics', 'diagrams', 'faults', 'safety'],
    category: 'Operations',
    priority: 8,
    relatedTopics: ['safety', 'troubleshooting']
  },
  {
    id: 'yacht-hvac',
    question: 'HVAC and air conditioning',
    answer: "Get instant help with climate control systems, air conditioning troubleshooting, ventilation issues, and maintenance schedules. Includes refrigeration systems and environmental controls.",
    keywords: ['hvac', 'air conditioning', 'climate', 'cooling', 'heating', 'ventilation', 'refrigeration'],
    category: 'Operations',
    priority: 7,
    relatedTopics: ['maintenance', 'comfort']
  },
  {
    id: 'yacht-navigation',
    question: 'Navigation and electronics',
    answer: "Support for GPS, radar, sonar, communication equipment, and bridge electronics. Access user manuals, calibration procedures, and troubleshooting guides for marine electronics.",
    keywords: ['navigation', 'gps', 'radar', 'sonar', 'electronics', 'communication', 'bridge', 'equipment'],
    category: 'Operations',
    priority: 8,
    relatedTopics: ['electronics', 'safety']
  },

  // Maintenance
  {
    id: 'maintenance-schedule',
    question: 'Maintenance scheduling',
    answer: "CelesteOS tracks maintenance schedules, service intervals, and inspection requirements. Get reminders for upcoming services and access detailed maintenance procedures for all systems.",
    keywords: ['maintenance', 'schedule', 'service', 'intervals', 'inspection', 'preventive', 'routine'],
    category: 'Maintenance',
    priority: 8,
    relatedTopics: ['yacht-engine', 'planning']
  },
  {
    id: 'maintenance-parts',
    question: 'Parts and inventory management',
    answer: "Track spare parts, get part numbers, find suppliers, and manage inventory. The system can suggest replacement parts and provide procurement information.",
    keywords: ['parts', 'inventory', 'spare', 'suppliers', 'procurement', 'stock', 'components'],
    category: 'Maintenance',
    priority: 7,
    relatedTopics: ['maintenance-schedule', 'business']
  },

  // Emergency & Safety
  {
    id: 'emergency-procedures',
    question: 'Emergency procedures',
    answer: "Instant access to emergency protocols, safety procedures, fire suppression, abandon ship procedures, and medical emergencies. Critical information available even offline.",
    keywords: ['emergency', 'safety', 'procedures', 'fire', 'medical', 'abandon', 'ship', 'crisis', 'urgent'],
    category: 'Safety',
    priority: 10,
    relatedTopics: ['safety', 'training']
  },
  {
    id: 'safety-protocols',
    question: 'Safety protocols and compliance',
    answer: "Access ISM procedures, safety management systems, compliance checklists, and regulatory requirements. Stay up-to-date with maritime safety standards.",
    keywords: ['safety', 'protocols', 'compliance', 'ism', 'regulations', 'standards', 'maritime', 'legal'],
    category: 'Safety',
    priority: 9,
    relatedTopics: ['emergency-procedures', 'regulations']
  },

  // Documents & Manuals
  {
    id: 'documents-access',
    question: 'Document organization',
    answer: "All your technical documents are automatically indexed and searchable. Manuals, schematics, procedures, and notes are organized by system, equipment, and topic for instant access.",
    keywords: ['documents', 'manuals', 'organization', 'indexed', 'searchable', 'schematics', 'procedures'],
    category: 'Documents',
    priority: 8,
    relatedTopics: ['system-speed', 'search']
  },
  {
    id: 'documents-formats',
    question: 'Supported document formats',
    answer: "CelesteOS supports PDF, Word, Excel, DWG, images, and scanned documents. Even handwritten notes can be indexed and made searchable through OCR technology.",
    keywords: ['formats', 'pdf', 'word', 'excel', 'dwg', 'images', 'scanned', 'ocr', 'handwritten'],
    category: 'Documents',
    priority: 6,
    relatedTopics: ['documents-access', 'technology']
  }
];

// Function to search FAQ database
export function searchFAQ(query: string, limit: number = 5): FAQItem[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const words = searchTerm.split(' ').filter(word => word.length > 2);
  
  // Score each FAQ item based on relevance
  const scoredItems = faqDatabase.map(item => {
    let score = 0;
    
    // Exact question match (highest priority)
    if (item.question.toLowerCase().includes(searchTerm)) {
      score += 100;
    }
    
    // Keyword matches
    const matchingKeywords = item.keywords.filter(keyword => 
      keyword.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(keyword.toLowerCase()) ||
      words.some(word => keyword.toLowerCase().includes(word))
    );
    score += matchingKeywords.length * 20;
    
    // Answer content match
    if (item.answer.toLowerCase().includes(searchTerm)) {
      score += 10;
    }
    
    // Word matches in answer
    const answerWords = words.filter(word => 
      item.answer.toLowerCase().includes(word)
    );
    score += answerWords.length * 5;
    
    // Category relevance
    if (item.category.toLowerCase().includes(searchTerm)) {
      score += 15;
    }
    
    // Base priority score
    score += item.priority;
    
    return { ...item, score };
  });
  
  // Filter and sort by score
  return scoredItems
    .filter(item => item.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Function to get related FAQs
export function getRelatedFAQs(currentId: string, limit: number = 3): FAQItem[] {
  const currentItem = faqDatabase.find(item => item.id === currentId);
  if (!currentItem) return [];
  
  const related = faqDatabase
    .filter(item => 
      item.id !== currentId && 
      (item.category === currentItem.category ||
       item.keywords.some(k => currentItem.keywords.includes(k)) ||
       currentItem.relatedTopics.includes(item.id))
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
  
  return related;
}

// Function to get FAQs by category
export function getFAQsByCategory(category: string): FAQItem[] {
  return faqDatabase
    .filter(item => item.category === category)
    .sort((a, b) => b.priority - a.priority);
}

// Function to get top priority FAQs
export function getTopFAQs(limit: number = 8): FAQItem[] {
  return faqDatabase
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}