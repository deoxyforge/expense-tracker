# Expense Tracker App - Technical Design Document (TDD)

**Project Name:** Expense Tracker  
**Version:** 1.1  
**Document Type:** Technical Design Document (SPA Website Version with AI Integration)

---

# 1. Project Overview
Expense Tracker (Apex Spend) is a high-fidelity single-page web application. This document details the client-side AI Integration architecture utilizing the Google Gemini API.

---

# 2. System Architecture with Gemini API
```plain text
+-------------------------------------------------------+
|                        Client                         |
|                     (index.html)                      |
|                  UI Elements & Chat                   |
+---------------------------+---------------------------+
                            |
                   HTTPS POST Request
                            |
                            v
+-------------------------------------------------------+
|                 Google Gemini API                     |
|  Endpoint: /v1beta/models/gemini-2.0-flash            |
|  Query Param: ?key=localStorage[gemini_key]           |
+---------------------------+---------------------------+
                            |
                     JSON Response
                            |
                            v
+-------------------------------------------------------+
|                    Controller                         |
|                     (app.js)                          |
|    Parses AI markdown and displays chat bubble        |
+-------------------------------------------------------+
```

---

# 3. AI Chatbot Integration Details
## API Details
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`
- **HTTP Method**: `POST`
- **Headers**: `Content-Type: application/json`

## Payload Structure
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "User question here (e.g., 'Am I spending too much on restaurants?')"
        }
      ]
    }
  ],
  "systemInstruction": {
    "parts": [
      {
        "text": "System instruction defining persona, rules, and injecting current user data."
      }
    ]
  }
}
```

## System Instruction Context
The controller will construct a system instruction that contains:
1. **Advisor Persona**: Friendly, concise personal finance assistant.
2. **Context Injection**: Current date, preferred currency, budget targets, category configurations.
3. **Transaction Data**: Injected as a structured list:
   ```json
   {
     "budget_limit": 1500,
     "currency": "$",
     "current_month_expenses": 296.19,
     "transactions": [
       { "title": "Whole Foods Market", "amount": 154.2, "type": "expense", "category": "Food & Dining", "date": "2026-07-02" }
     ]
   }
   ```
4. **Output Constraints**: Direct responses under 3 sentences where possible. Return answers styled in clean markdown.

## Key Management & Fallback
- **Storage**: Key is saved in `localStorage` under `apex_spend_gemini_key` using a secure `<input type="password">` field in Settings.
- **Fallback Engine**: If `apex_spend_gemini_key` is empty, invalid, or API requests fail, the chatbot falls back to the local keyword-matching rules engine.

---

# 4. Storage Scheme (Local Storage Keys)
- `apex_spend_state`: Primary tracker configuration and transaction history.
- `apex_spend_gemini_key`: User's Google Gemini API key.
