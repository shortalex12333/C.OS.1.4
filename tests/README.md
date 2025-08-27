# Tests

Test files and scripts for CelesteOS.

## Structure

```
tests/
├── html/          # HTML test pages
│   ├── appearance-test.html
│   ├── auth-test-minimal.html
│   ├── auth-test-ms.html
│   ├── auth-test.html
│   ├── background-test.html
│   └── theme-preview.html
└── scripts/       # Test automation scripts
    ├── execute_step_by_step.sh
    ├── test-all-webhooks.sh
    ├── test-appearance-functionality.sh
    ├── test-complete-flow.sh
    ├── test-dark-mode-v2.sh
    ├── test-email-workflow-integration.sh
    ├── test-email-workflow.sh
    ├── test-fixes-complete.sh
    ├── test-handover-export.sh
    ├── test-supabase-auth.sh
    ├── test-theme-switching.sh
    ├── test-tutorial-flow.sh
    ├── test-webhook-phase1.sh
    ├── test-webhook-status.sh
    ├── verify-production.sh
    └── verify-webhook-config.sh
```

## Running Tests

### HTML Tests
Open HTML files directly in browser for manual testing.

### Script Tests
Run from project root:
```bash
./tests/scripts/test-name.sh
```