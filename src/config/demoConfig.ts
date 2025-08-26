export const demoConfig = {
  version: "1.0",
  product: "CelesteOS Demo",
  defaults: {
    source: "NAS",
    models_visible: false,
    security_ribbon: false
  },

  copy: {
    placeholders: {
      search: "Search manuals, fault codes, invoices or filenames…"
    },
    guided_prompts: [
      "Find stabilizer fault log (last 30 days)",
      "Manual for hydraulic pump P/N 925-…",
      "Invoice for generator service, April"
    ],
    tooltips: {
      welcome: "Find documents in seconds. Try a fault code, part number, invoice, or filename.",
      switch_suggest: "Not seeing what you need? Try EMAIL search — we'll look through Outlook safely, read-only.",
      result_hint: "Results can be exported as a handover PDF later.",
      handover_path: "To export a demo handover PDF: Settings → Handover → Send to my email.",
      handover_dates: "Pick 7 / 30 / 60 / 90 days or set a custom range. We'll email the PDF to your sign-in address.",
      handover_sent: "Handover sent. Check your inbox. The email includes a link to schedule an install.",
      no_results: "No luck yet. Try a filename, part/PO number, or switch to EMAIL search."
    },
    disclosure: "We log anonymized queries to improve results. On-prem demo data only. No yacht data is uploaded."
  },

  behaviors: {
    intro_stream: {
      enabled: true,
      screens: [
        {
          lines: [
            "Chiefs lose ~2 hours a day searching manuals and emails.",
            "Handovers drag, knowledge gets lost, mistakes repeat."
          ],
          duration_ms: 3500
        },
        {
          lines: [
            "CelesteOS finds the right document in seconds.",
            "Handover notes: 30 seconds.",
            "Save 10+ hours a week, per engineer."
          ],
          duration_ms: 3500
        },
        {
          lines: [
            "Runs offline, on your yacht's LAN.",
            "Read-only: no data ever leaves your NAS.",
            "Built for Captains and Chiefs."
          ],
          duration_ms: 3500,
          transition_to: "app"
        }
      ]
    },

    onboarding: [
      {
        id: "welcome_hint",
        trigger: { event: "first_load" },
        action: {
          type: "tooltip",
          target: "search_input",
          text: "Find documents in seconds. Try a fault code, part number, invoice, or filename.",
          auto_hide_ms: 4000
        }
      },
      {
        id: "show_prompts",
        trigger: { event: "first_load" },
        action: {
          type: "show_prompts"
        }
      },
      {
        id: "post_first_result",
        trigger: { event: "result_rendered", count: 1 },
        action: {
          type: "tooltip",
          target: "result_container",
          text: "Results can be exported as a handover PDF later.",
          auto_hide_ms: 3000
        }
      },
      {
        id: "suggest_email_after_2",
        trigger: { event: "query_submitted", count: 2 },
        condition: { last_two_results: "low_or_none" },
        action: {
          type: "tooltip",
          target: "source_switcher",
          text: "Not seeing what you need? Try EMAIL search — we'll look through Outlook safely, read-only.",
          auto_hide_ms: 4500,
          nudge: { highlight_option: "EMAIL" }
        }
      },
      {
        id: "handover_after_4",
        trigger: { event: "query_submitted", count: 4 },
        action: {
          type: "callout",
          style: "subtle",
          text: "To export a demo handover PDF: Settings → Handover → Send to my email.",
          cta: {
            label: "Open Handover",
            target: "settings_handover"
          }
        }
      }
    ]
  },

  visibility_logic: {
    models_menu: {
      visible_when: "user_opens_brand_dropdown",
      menu_copy: [
        { name: "Power", note: "High-precision search & RAG" },
        { name: "Reach", note: "Balanced speed/accuracy" },
        { name: "Air", note: "Fastest responses" }
      ]
    }
  }
};