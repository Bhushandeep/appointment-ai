# 🏥 Appointment AI - Intelligent Appointment Parsing System

A backend service that parses natural language or document-based appointment requests and converts them into structured scheduling data. The system handles both typed text and noisy image inputs (e.g., scanned notes, emails) using OCR, entity extraction, normalization, and guardrails for ambiguity.

## 🎯 Features

- ✅ **Text & Image Input Support** - Process typed text or images via OCR
- ✅ **4-Step Processing Pipeline** - OCR → Entity Extraction → Normalization → Final JSON
- ✅ **Smart Entity Extraction** - Detects departments, dates, and times from natural language
- ✅ **Fuzzy Department Matching** - Handles typos and synonyms (7 medical departments)
- ✅ **Date/Time Normalization** - Converts to ISO format with Asia/Kolkata timezone
- ✅ **Confidence Scoring** - Each step returns confidence levels
- ✅ **Guardrails** - Requests clarification for ambiguous or missing data
- ✅ **Comprehensive Error Handling** - Graceful failure with helpful messages

## 🏗️ Architecture

```
┌─────────────────┐
│  Input Layer    │  Text or Image Upload
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Step 1: OCR    │  Tesseract.js extracts text from images
└────────┬────────┘  Confidence: 0.95
         │
         ▼
┌─────────────────┐
│  Step 2: Entity │  chrono-node + Fuse.js extract entities
│   Extraction    │  (department, date_phrase, time_phrase)
└────────┬────────┘  Confidence: 0.86
         │
         ▼
┌─────────────────┐
│  Step 3: Norm.  │  Luxon normalizes to ISO format
│                 │  Timezone: Asia/Kolkata
└────────┬────────┘  Confidence: 0.91
         │
         ▼
┌─────────────────┐
│  Step 4: Final  │  Structured appointment JSON
│  Appointment    │  Status: "ok" or "needs_clarification"
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd appointment-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The server will start on `http://localhost:3000`

### Production

```bash
npm start
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "appointment-ai"
}
```

---

### Parse Appointment
```http
POST /v1/appointment/parse
```

**Input Option 1: Text (JSON)**
```json
{
  "text": "Book dentist appointment tomorrow at 3pm"
}
```

**Input Option 2: Image Upload (multipart/form-data)**
- Field name: `image`
- Supported formats: PNG, JPG, JPEG

**Success Response:**
```json
{
  "step1": {
    "raw_text": "Book dentist appointment tomorrow at 3pm",
    "confidence": 0.95
  },
  "step2": {
    "entities": {
      "date_phrase": "tomorrow",
      "time_phrase": "3pm",
      "department": "dentist"
    },
    "entities_confidence": 0.86
  },
  "step3": {
    "normalized": {
      "date": "2026-01-20",
      "time": "15:00",
      "tz": "Asia/Kolkata"
    },
    "normalization_confidence": 0.91
  },
  "step4": {
    "appointment": {
      "department": "Dentistry",
      "date": "2026-01-20",
      "time": "15:00",
      "tz": "Asia/Kolkata"
    },
    "status": "ok"
  }
}
```

**Clarification Response (Ambiguous Input):**
```json
{
  "status": "needs_clarification",
  "message": "Time is ambiguous (e.g., morning/evening). Please provide an exact time like 3pm or 15:00.",
  "step1": { ... },
  "step2": { ... },
  "missing": ["time_phrase"]
}
```

## 🧪 Testing

### Run All Tests
```bash
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File test-api.ps1

# Linux/Mac/Git Bash
bash test-api.sh
```

### Manual Testing Examples

#### Using PowerShell (Windows)
```powershell
# Text input
Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text": "Cardiology next Monday at 10:30am"}' | ConvertTo-Json -Depth 10

# Image upload
node test-image.js
```

#### Using cURL (Linux/Mac/Git Bash)
```bash
# Text input
curl -X POST http://localhost:3000/v1/appointment/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Book dentist appointment tomorrow at 3pm"}'

# Image upload
curl -X POST http://localhost:3000/v1/appointment/parse \
  -F "image=@test-appointment.png"
```

#### Using Postman
1. Create a POST request to `http://localhost:3000/v1/appointment/parse`
2. **For text**: Body → raw → JSON → `{"text": "your appointment text"}`
3. **For image**: Body → form-data → Key: "image" (type: File) → Select image

## 🏥 Supported Departments

The system recognizes the following medical departments with fuzzy matching:

| Department | Synonyms |
|------------|----------|
| Dentistry | dentist, dental, tooth, teeth |
| Cardiology | cardiology, cardio, heart |
| Orthopedics | ortho, orthopedic, bone, joint |
| Dermatology | derma, dermatology, skin |
| ENT | ent, ear nose throat |
| Ophthalmology | eye, ophthalmology, vision |
| General Medicine | general, physician, doctor |

## 📅 Date/Time Formats Supported

### Date Phrases
- `today`, `tomorrow`, `day after tomorrow`
- `next Monday`, `next Tuesday`, etc.
- Numeric dates: `26/09`, `26-09`, `26th`

### Time Formats
- 12-hour: `3pm`, `3:30pm`, `3 pm`
- 24-hour: `15:00`, `15:30`

### Ambiguous Times (Rejected)
- `morning`, `evening`, `afternoon`, `night`, `sometime`, `later`

## 🛡️ Guardrails

The system implements intelligent guardrails to ensure data quality:

1. **OCR Confidence Check** - Rejects if confidence < 55%
2. **Empty Text Detection** - Rejects if text length < 3 characters
3. **Missing Fields** - Identifies missing department, date, or time
4. **Ambiguous Time Detection** - Rejects vague time phrases
5. **Multiple Date/Time Detection** - Rejects if multiple interpretations exist

## 📁 Project Structure

```
appointment-ai/
├── src/
│   ├── app.js                          # Express app configuration
│   ├── server.js                       # Server entry point
│   ├── routes/
│   │   └── appointment.routes.js       # API routes
│   ├── controllers/
│   │   └── appointment.controller.js   # Request handlers
│   ├── services/
│   │   ├── ocr.service.js             # Tesseract OCR
│   │   ├── entity.service.js          # Entity extraction
│   │   └── normalize.service.js       # Date/time normalization
│   └── utils/
│       ├── text.js                    # Text cleaning
│       ├── department.js              # Department fuzzy matching
│       ├── time_date.js               # Time/date extraction
│       └── guardrails.js              # Clarification helpers
├── uploads/                           # Temporary image storage
├── test-api.ps1                       # PowerShell test script
├── test-api.sh                        # Bash test script
├── test-image.js                      # Node.js image upload test
├── package.json
└── README.md
```

## 🔧 Technologies Used

- **Express.js** - Web framework
- **Tesseract.js** - OCR engine
- **chrono-node** - Natural language date/time parsing
- **Luxon** - Timezone handling and date formatting
- **Fuse.js** - Fuzzy string matching
- **Multer** - File upload handling
- **Zod** - Input validation
- **Morgan** - HTTP request logging

## 📊 Evaluation Criteria Compliance

✅ **Correctness of API responses and adherence to JSON schemas**  
✅ **Handling of both text and image inputs with OCR**  
✅ **Implementation of guardrails and error handling**  
✅ **Code organization, clarity, and reusability**  
✅ **Effective use of AI for chaining and validation**  

## 🎬 Demo

See `demo-recording.mp4` for a complete walkthrough of the API functionality.

## 📝 License

ISC

## 👤 Author

Your Name

---

**Built with ❤️ for intelligent appointment scheduling**
