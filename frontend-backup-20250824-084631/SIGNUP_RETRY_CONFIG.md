# Signup Retry Configuration ⏱️

## Updated Settings:

### Request Timeout:
- **Signup**: 10,000ms (10 seconds)
- **Login**: 5,000ms (5 seconds)
- **Other requests**: 30,000ms (30 seconds)

### Retry Delays:
- **Signup retries**: 10,000ms (10 seconds between retry attempts)
- **Other requests**: 1,000ms (1 second between retry attempts)

### Max Retries:
- **All auth requests**: 2 attempts maximum
- **Chat requests**: 1 attempt (optimized for speed)

## Implementation:

```javascript
// In handleSubmit (AuthScreen):
const result = await sendRequestWithRetry(endpoint, payload, { 
  maxRetries: 2, 
  timeout: isSignup ? 10000 : 5000 // 10s for signup, 5s for login
});

// In sendRequestWithRetry function:
const retryDelay = endpoint.includes('signup') ? 10000 : API_CONFIG.retryDelay;
```

## Benefits:
- ✅ **Prevents Rapid Requests**: 10-second gaps prevent API hammering
- ✅ **Better UX**: Users see clear feedback during signup delays
- ✅ **Server Friendly**: Reduces load on authentication endpoints
- ✅ **Error Handling**: Proper retry logic with logging

## User Experience:
- Signup requests now have proper spacing to prevent multiple rapid attempts
- Users will see loading states during the 10-second timeout periods
- Clear retry attempt logging in console for debugging

**Signup process is now properly rate-limited!** 🚀