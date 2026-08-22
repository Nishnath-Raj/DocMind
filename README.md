# 🚀 DocMind — AI Document Summary Assistant

> An intelligent full-stack document analysis application that transforms PDFs and images into structured, AI-powered insights.

**Live Demo:** https://docmind-frontend-y8gt.onrender.com

**GitHub:** https://github.com/Nishnath-Raj/DocMind

---

## ✨ Overview

DocMind is a full-stack document analysis assistant built to process both digitally generated and scanned documents.

Users can upload PDF or image files, choose their preferred summary length, and receive an AI-generated analysis containing:

* 📄 Document summary
* 🔑 Key points
* 💡 Main ideas
* 🏷️ Topics
* ✨ Improvement suggestions
* 📊 Document statistics
* 🔍 Processing method
* 🎯 Confidence information

The application is designed to provide a simple user experience while handling real-world documents that may require either native text extraction or OCR.

---

## 🎯 Features

### 📤 Document Upload

* PDF support
* PNG/JPG image support
* Drag-and-drop upload
* File picker support
* File validation
* User-friendly error messages

### 📖 Intelligent Text Extraction

DocMind uses different extraction strategies depending on the document:

**Digital PDFs**

→ Native text extraction using PyMuPDF

**Scanned PDFs**

→ Automatic fallback to OCR when insufficient native text is detected

**Images**

→ OCR processing using Tesseract

This allows DocMind to work with both normal digital documents and scanned documents.

### 🤖 AI-Powered Analysis

Users can select:

* Short
* Medium
* Long

The AI analysis provides:

* Summary
* Key points
* Main ideas
* Topics
* Improvement suggestions
* Confidence note

### 📊 Document Information

The application also reports:

* Document type
* Page count
* Word count
* Character count
* Processing method
* Processing mode
* Summary length

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      User            │
                    │  PDF / Image Upload  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + TypeScript │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ PDF Processing  │         │   OCR Service   │
        │    PyMuPDF      │         │    Tesseract    │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌──────────────────────┐
                    │   Extracted Text     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Groq AI Service   │
                    │  Document Analysis   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Structured Analysis  │
                    │ Summary + Insights   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Results UI   │
                    └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Python
* FastAPI
* PyMuPDF
* Pillow
* Tesseract OCR
* Groq API

### Deployment

* Render Static Site — Frontend
* Render Web Service — Backend
* GitHub — Source Control

---

## 🔄 Processing Flow

```text
Upload Document
      │
      ▼
Validate File
      │
      ▼
Identify Document Type
      │
      ├── Image ──────────────► OCR
      │
      └── PDF
           │
           ▼
      Native PDF Extraction
           │
           ├── Sufficient Text ─────► Continue
           │
           └── Insufficient Text ───► OCR
                                      │
                                      ▼
                               Extracted Text
                                      │
                                      ▼
                              AI Document Analysis
                                      │
                                      ▼
                            Structured Response
                                      │
                                      ▼
                               Results Interface
```

---

## 🌐 Live Deployment

### Frontend

https://docmind-frontend-y8gt.onrender.com

### Backend API

https://docmind-7ly1.onrender.com

### API Health Check

https://docmind-7ly1.onrender.com/health

---

## 📸 Application

The application provides a clean interface focused on the core workflow:

**Upload → Extract → Analyze → Understand**

Users can upload their document, choose a summary length, and view the generated analysis without needing to interact with the backend directly.

---

## ⚙️ Local Development

### Prerequisites

Make sure you have:

* Python 3.x
* Node.js
* npm
* Tesseract OCR

### 1. Clone the repository

```bash
git clone https://github.com/Nishnath-Raj/DocMind.git
cd DocMind
```

### 2. Backend setup

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

For local development, the frontend can use:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production:

```env
VITE_API_BASE_URL=https://docmind-7ly1.onrender.com
```

---

## 🔐 Environment Variables

Secrets are intentionally excluded from source control.

### Backend

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model
```

### Frontend

```env
VITE_API_BASE_URL=your_backend_url
```

Do **not** commit real API keys or `.env` files.

---

## 📁 Project Structure

```text
DocMind/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── documents.py
│   │   ├── schemas/
│   │   │   ├── analysis.py
│   │   │   └── document.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── document_service.py
│   │   │   └── ocr_service.py
│   │   └── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🧪 Quality & Validation

The project includes:

* TypeScript type safety
* ESLint configuration
* Production frontend build
* Backend validation
* API error handling
* Upload validation
* OCR error handling
* Loading states
* Production CORS configuration
* Health-check endpoint

Frontend validation:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## 🚀 Production Deployment

The production system is split into two services:

```text
GitHub Repository
       │
       ├──────────────► Render Static Site
       │                    │
       │                    ▼
       │              React Frontend
       │
       └──────────────► Render Web Service
                            │
                            ▼
                       FastAPI Backend
```

The frontend communicates with the deployed FastAPI backend through the production API URL.

CORS is configured to allow the deployed frontend origin.

---

## 💡 Design Decisions

### Why native PDF extraction first?

Digitally generated PDFs generally contain machine-readable text, making native extraction faster and more reliable than OCR.

### Why OCR fallback?

Scanned PDFs may contain pages that are effectively images rather than text. Detecting insufficient extracted text and falling back to OCR allows the same application to handle both document types.

### Why separate services?

Separating document extraction, OCR, and AI analysis keeps the backend modular and makes individual processing responsibilities easier to maintain and extend.

---

## 📋 Technical Assessment

This project was developed as a practical full-stack software engineering assessment demonstrating:

* Frontend development
* REST API development
* Document processing
* OCR integration
* AI integration
* Error handling
* Responsive UI development
* Production deployment
* Environment configuration
* Git-based development workflow

---

## 👨‍💻 Author

**Nishnath Raj**

GitHub: https://github.com/Nishnath-Raj/DocMind

---

## 📄 License

This project was created for technical assessment and demonstration purposes.





## Approach

DocMind is designed as a full-stack document analysis application with a React and TypeScript frontend communicating with a FastAPI backend through REST APIs.

For document processing, the backend accepts both PDF and image files. PDFs are first processed using PyMuPDF to extract machine-readable text while preserving the document's structure as much as practical. When a PDF contains little or no extractable text, the application uses OCR as a fallback for scanned documents. Image uploads are processed through OCR to convert their contents into usable text.

The extracted text is then passed to the AI analysis layer using the Groq API. Users can select short, medium, or long summaries, and the system generates structured results containing the summary, key points, main ideas, topics, and improvement suggestions.

The frontend focuses on a simple, responsive upload and results experience, including drag-and-drop support, loading states, validation, and user-friendly error handling.

For deployment, the frontend and backend are hosted separately on Render. Environment variables are used for production configuration and API credentials, while CORS is configured to securely allow communication between the deployed frontend and backend.

The project is organized into separate frontend and backend components to keep responsibilities clear, maintainable, and easy to extend.

