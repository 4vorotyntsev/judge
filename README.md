# Judge - AI-Powered Tinder Profile Evaluator

A web application that uses AI "judges" with unique personas to evaluate your Tinder profile pictures and generate improved versions based on their feedback.

## Features

- 🎭 **Multiple AI Judges**: Select from various personas (male/female) to evaluate your photos
- 📸 **Photo Upload**: Upload your profile picture for analysis
- 💬 **Personalized Feedback**: Each judge provides feedback in-character
- 🎨 **AI Image Generation**: Generate improved versions of your photo based on combined feedback
- ⚙️ **Customizable**: Add custom judges and configure generation settings

## Tech Stack

- **Frontend**: React 19 + Vite + TailwindCSS + Framer Motion
- **Backend**: Python FastAPI + Uvicorn
- **AI**: OpenRouter API (GPT-4o-mini for evaluation, Gemini 3 Pro for image generation)

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (v3.9 or higher)
- **OpenRouter API Key** - Get one at [openrouter.ai](https://openrouter.ai/)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd judge
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

### Start Backend Server

```bash
# From the backend directory (with venv activated)
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the FastAPI server
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**

### Start Frontend Development Server

```bash
# From the frontend directory (in a new terminal)
cd frontend

# Start the Vite dev server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## Usage

1. **Open the app** at `http://localhost:5173`
2. **Enter your OpenRouter API key** when prompted
3. **Select judges** by clicking on their avatars (male judges on left, female on right)
4. **Upload your profile picture**
5. **View feedback** from each selected judge
6. **Generate improved photos** based on the combined suggestions

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/evaluate` | POST | Evaluate an image with a specific persona |
| `/api/combine` | POST | Combine feedback from multiple judges |
| `/api/generate` | POST | Generate improved images based on suggestions |

---

## Project Structure

```
judge/
├── backend/
│   ├── main.py           # FastAPI application & routes
│   ├── llm_utils.py      # AI/LLM utility functions
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   └── components/   # React components
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
└── README.md
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure both frontend and backend are running. The backend allows all origins by default.

2. **API Key Issues**: Ensure your OpenRouter API key is valid and has credits available.

3. **Port Conflicts**: 
   - Backend default: `8000`
   - Frontend default: `5173`
   
   If these ports are in use, you can change them:
   ```bash
   # Backend: modify port in main.py or use
   uvicorn main:app --port 8001
   
   # Frontend: modify in vite.config.js or use
   npm run dev -- --port 3000
   ```

4. **Image Generation Fails**: Ensure you're using a model that supports image generation on OpenRouter.

---

## Development

### Frontend Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Commands

```bash
python main.py                    # Run server
uvicorn main:app --reload         # Run with hot reload
```

---

## License

ISC
