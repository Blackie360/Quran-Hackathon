# Gemini AI Interpretation Feature Setup Guide

## Overview
This application now includes AI-powered interpretation of Quranic verses using Google's Gemini API. When users view verses, they can request AI-generated interpretations with context, meaning, themes, spiritual lessons, and modern applications.

## Features Added

### 1. **Gemini AI Service** (`src/app/services/gemini-ai.service.ts`)
- Handles all communication with Google Gemini API
- Stores API key securely in browser localStorage
- Manages API key lifecycle (set, get, clear, validate)
- Generates contextual prompts for verse interpretation

### 2. **API Key Modal Component** (`src/app/components/api-key-modal/`)
- Beautiful modal interface for entering Gemini API key
- Links to Google AI Studio for easy key generation
- Stores API key locally in the browser
- Only shown once on first "Get Started" click

### 3. **AI Interpretation Component** (`src/app/components/ai-interpretation/`)
- Displays AI-generated verse interpretations
- Shows loading state with spinner
- Handles errors gracefully with retry option
- Beautiful purple gradient card with smooth animations

### 4. **Integration Points**
- **Landing Page**: Shows API key modal on "Get Started" button
- **Verse Display**: Each verse has an AI interpretation toggle button
- **Verse Details**: Dedicated section for AI interpretation

## Setup Instructions

### Step 1: Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new free API key
4. Copy the key (keep it secure!)

### Step 2: Use the App
1. Click "Get Started" on the landing page
2. A modal will appear asking for your API key
3. Paste your Gemini API key
4. Click "Save API Key"
5. You're ready to use AI interpretation!

### Step 3: View AI Interpretations
- **In Verse Display (Chapter View)**:
  - Scroll through verses
  - Click "Get AI Interpretation" button
  - Wait for the AI response (usually 2-5 seconds)

- **In Verse Details (Full Verse View)**:
  - Open any verse for detailed view
  - Click "Get AI Interpretation" button
  - View the comprehensive analysis

## How It Works

### Interpretation Content
The AI provides:
- **Context**: Historical and contextual background of the verse
- **Meaning**: Deep explanation of the verse's meaning
- **Key Themes**: Main theological and spiritual concepts
- **Spiritual Lesson**: What Muslims can learn from the verse
- **Modern Application**: How the verse applies to contemporary life

### API Key Storage
- API key is stored **locally in your browser** (localStorage)
- NOT sent to any server except Google's Gemini API
- You can clear it anytime through the API key modal

## Important Notes

⚠️ **Privacy & Security**:
- Your API key is stored locally, not on our servers
- Only the verse text and translation are sent to Google's Gemini API
- Google's privacy policy applies to API usage: https://ai.google.dev/privacy

⚠️ **Limitations**:
- Free tier has rate limits
- Interpretations take 2-5 seconds depending on API load
- Requires internet connection

⚠️ **Best Practices**:
- Keep your API key confidential
- Monitor your API usage on Google Cloud Console
- Consider setting usage limits to avoid unexpected charges

## Component Structure

```
Landing Component
├── API Key Modal
│   └── Triggers on "Get Started"
│
Verse Display Component
├── AI Interpretation Button (per verse)
├── AI Interpretation Component
└── API Key Modal

Verse Details Component
├── AI Interpretation Button
├── AI Interpretation Component
└── API Key Modal
```

## Technical Details

### Services Used
- `GeminiAiService`: Manages API interactions
- `QuranService`: Provides verse data
- `StudyStorageService`: Local storage for notes/bookmarks

### API Endpoint
- Base: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Method: POST
- Authentication: API key in query parameter

### Storage
- localStorage key: `gemini_api_key`
- Verse-specific data also stored locally for bookmarks/notes

## Troubleshooting

### "API key not set" Error
- Make sure you've entered and saved your API key
- Click "Get Started" again to open the modal

### "Failed to get interpretation"
- Check your internet connection
- Verify your API key is valid
- Check if you've exceeded API rate limits
- Visit Google Cloud Console to verify API is enabled

### Slow Interpretations
- Google's API may be experiencing higher load
- Try again after a few seconds
- Shorter verses typically process faster

## Disabling the Feature

To remove API key:
1. Open any verse
2. Look for a settings option or API key modal
3. The feature can be disabled by not setting an API key

## Future Enhancements

Possible improvements:
- Caching of interpretations to reduce API calls
- Offline mode with cached responses
- Multiple language interpretations
- Audio narration of interpretations
- Custom interpretation prompts
- Comparison of multiple interpretations

## Support

For issues with:
- **Gemini API**: See https://ai.google.dev/docs
- **This App**: Check the main README.md

---

**Version**: 1.0  
**Last Updated**: May 15, 2026  
**Feature Status**: Production Ready ✅
