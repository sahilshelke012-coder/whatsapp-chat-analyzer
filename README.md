# 📊 WhatsApp Chat Analyzer

A production-ready, full-stack **WhatsApp Chat Analyzer** application designed to process exported WhatsApp `.txt` chat backups and generate interactive analytics, statistics, user activity heatmaps, and content visual insights.

Designed for high performance, modular architecture, and modern responsive design.

---

## 🌟 Key Features

### 1. File Upload & Validation
- Drag-and-drop or browse file selection for WhatsApp exported `.txt` chat files.
- Strict validation for `.txt` extensions, MIME types, and file size limits (15MB max).
- Supports 12-hour (AM/PM) and 24-hour timestamp formats across Android and iOS exports.
- Automated cleanup of temporary upload files immediately after parsing for privacy and security.

### 2. Overall Chat Summary
- **Total Messages**: Aggregate count of all chat messages.
- **Total Words**: Total words spoken across the conversation.
- **Total Media Shared**: Total images, videos, audio clips, stickers, and documents shared.
- **Total Links**: Count of extracted HTTP/HTTPS web links.
- **Participant Count**: Total number of conversation members.
- **Most Active Participant**: Top contributing member and average messages per day.

### 3. Interactive Visual Dashboard (Chart.js)
- **Messages Timeline (By Date)**: Line chart tracking conversation intensity over time.
- **Monthly Distribution**: Bar chart comparing messaging volume per month.
- **Hourly Heatmap (0–23h)**: Bar chart identifying peak messaging hours during the day.
- **Day-of-Week Breakdown**: Activity distribution from Monday to Sunday.
- **Participant Contribution Share**: Doughnut chart visualizing message breakdown per member.

### 4. Participant Activity Analysis
- Detailed comparative table containing:
  - Participant name & avatar initial badge
  - Total message count
  - Total word count
  - Total media items shared
  - Activity contribution percentage bar & badge

### 5. Content & Emoji Analysis
- **Most Frequently Used Words**: Clean word cloud tags filtered against English & multilingual stop words.
- **Emoji Frequency**: Ranked emoji cards displaying top used emojis.
- **Extracted Shared Links Table**: Detailed table listing shared URLs, sender names, and timestamps.
- **Media Breakdown**: Per-participant breakdown of media items shared.

---

## 🛠️ Technology Stack

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Angular 18** | Single Page Application (Standalone Components, RxJS, Chart.js, Glassmorphism SCSS) |
| **Backend** | **Node.js + Express.js** | REST API Server (Multer File Upload, Middleware, Mongoose ORM) |
| **Analytics Microservice**| **Python 3** | Regex Chat Parser & Analytics Engine (Flask REST API, `emoji`, `urlextract`) |
| **Database** | **MongoDB** | Database persistence for analysis metadata summaries (Mongoose schema) |
| **API Architecture** | **REST API** | Decoupled HTTP REST communication between tiers |

---

## 📁 Project Folder Structure

```
Whatsapp-chat-analyzer/
├── frontend/                            # Angular 18 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── file-upload/         # Drag & drop upload component
│   │   │   │   ├── overall-stats/       # Summary KPI cards component
│   │   │   │   ├── dashboard/           # Chart.js visualization panel component
│   │   │   │   ├── user-stats/          # Participant activity table component
│   │   │   │   └── content-stats/       # Word frequency, emoji & links component
│   │   │   ├── core/
│   │   │   │   ├── models/              # TypeScript interfaces (analysis.model.ts)
│   │   │   │   └── services/            # HttpClient REST service (api.service.ts)
│   │   │   ├── app.component.ts         # Root component logic
│   │   │   ├── app.component.html       # Main application layout
│   │   │   └── app.component.scss       # Main layout styling
│   │   ├── index.html                   # HTML entry point (Google Fonts)
│   │   └── styles.scss                  # Global dark glassmorphism design tokens
│   ├── angular.json                     # Angular CLI build configuration
│   ├── package.json                     # Frontend dependencies
│   └── tsconfig.json                    # TypeScript compiler options
│
├── backend/                             # Express REST API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB Mongoose connection module
│   │   ├── controllers/
│   │   │   └── chatController.js        # Controller handlers for upload & analysis
│   │   ├── middleware/
│   │   │   ├── upload.js                # Multer upload & file validation
│   │   │   └── errorHandler.js          # Centralized Express error handler
│   │   ├── models/
│   │   │   └── Analysis.js              # Mongoose schema model stub
│   │   ├── routes/
│   │   │   └── chatRoutes.js            # Express REST API routes (/api/chat/*)
│   │   ├── services/
│   │   │   └── pythonService.js         # HTTP communication bridge to Python service
│   │   └── utils/
│   │       └── fileCleanup.js           # Immediate temporary file removal helper
│   ├── uploads/                         # Temporary storage directory (.gitignored)
│   ├── .env.example                     # Environment configuration template
│   ├── package.json                     # Backend Node dependencies
│   └── server.js                        # HTTP Server startup entry point
│
├── python-service/                      # Python Chat Analytics Microservice
│   ├── utils.py                         # Multilingual stopwords, emoji & URL extractors
│   ├── parser.py                        # WhatsApp text regex parser (iOS/Android)
│   ├── stats.py                         # Analytics metrics calculation engine
│   ├── main.py                          # Flask REST API server (/health, /api/analyze)
│   └── requirements.txt                 # Python dependencies (`flask`, `emoji`, `urlextract`)
│
├── sample_chat.txt                      # Sample WhatsApp export text file for testing
├── .gitignore                           # Git ignore rules
└── README.md                            # Complete documentation
```

---

## 🔌 API Endpoints Specification

### Backend API (Node.js Express - Port 5000)

#### `POST /api/chat/analyze`
- **Description**: Uploads a WhatsApp exported `.txt` chat file, triggers Python analysis, indexes summary metadata, and returns JSON statistics.
- **Content-Type**: `multipart/form-data`
- **Body**: `chatFile` (File object, `.txt` format)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Chat analysis completed successfully.",
  "data": {
    "id": "64f1a2b3c4e5f6...",
    "fileName": "WhatsApp Chat with Group.txt",
    "uploadedAt": "2026-08-17T12:00:00.000Z",
    "overall": {
      "totalMessages": 1420,
      "totalWords": 8500,
      "totalMedia": 95,
      "totalLinks": 34,
      "participantCount": 4,
      "mostActiveParticipant": "Alex",
      "avgMessagesPerDay": 23.6
    },
    "userAnalysis": [
      {
        "name": "Alex",
        "messages": 620,
        "words": 3900,
        "media": 45,
        "activityPercentage": 43.66
      }
    ],
    "timeAnalysis": {
      "byDate": [{ "date": "2026-01-01", "count": 45 }],
      "byMonth": [{ "month": "Jan 2026", "count": 350 }],
      "byDayOfWeek": [{ "day": "Monday", "count": 210 }],
      "byHour": [{ "hour": 14, "count": 185 }]
    },
    "contentAnalysis": {
      "topWords": [{ "word": "project", "count": 84 }],
      "topEmojis": [{ "emoji": "😂", "count": 120 }],
      "sharedLinks": [{ "url": "https://example.com", "sharedBy": "Alex", "date": "2026-02-10" }],
      "mediaStats": { "totalMedia": 95, "mediaByParticipant": { "Alex": 45 } }
    }
  }
}
```

#### `GET /api/health`
- **Description**: Health-check endpoint for Node.js Express server.
- **Response**: `{"status": "UP", "message": "WhatsApp Chat Analyzer API Service Running"}`

#### `GET /api/chat/python-health`
- **Description**: Verifies HTTP connectivity between Node.js backend and Python Flask microservice.

---

### Python Analytics Microservice (Flask - Port 5001)

#### `GET /health`
- **Description**: Health-check endpoint for Python service.
- **Response**: `{"status": "UP", "service": "Python WhatsApp Analyzer API Service"}`

#### `POST /api/analyze`
- **Description**: Low-level endpoint parsing chat content text and returning JSON stats.

---

## 🗄️ Database Details

- **Database**: MongoDB
- **ODM**: Mongoose
- **Connection Variable**: `MONGO_URI` (defined in `.env`)
- **Schema (`Analysis.js`)**:
```javascript
const AnalysisSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    results: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);
```

---

## 🚀 How to Run the Application

### Step 1: Start Python Analytics Service
```bash
cd python-service
pip install -r requirements.txt
python main.py
```
*(Runs on `http://127.0.0.1:5001`)*

### Step 2: Start Node.js Express Backend
```bash
cd backend
cp .env.example .env
npm install
node server.js
```
*(Runs on `http://127.0.0.1:5000` and connects to MongoDB)*

### Step 3: Start Angular Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npx ng serve --port 4200
```
*(Open browser at `http://localhost:4200/`)*

---

## 🛡️ Security & Privacy Standards
- **Zero Raw Text Storage**: User chat text is processed in-memory and temporary files are deleted immediately after analysis.
- **Secrets Management**: No database URIs, credentials, or API keys are hard-coded in source code. `.env` files are excluded in `.gitignore`.
- **Input Sanitization**: File type and format validation prevent malicious payload execution.
