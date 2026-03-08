# ChildFindr - Missing Child Search & Registration Platform

ChildFindr is a comprehensive platform designed to help communities and authorities locate missing children. It leverages advanced facial recognition technology to search through a database of registered missing children, facilitating quicker matches and more efficient search efforts.

## 🚀 Features

- **Facial Recognition Search:** Upload a photo of a child to find potential matches in our database using advanced AI embeddings.
- **Missing Child Registration:** Securely register a missing child with vital details, including photos and contact information.
- **Secure Authentication:** User accounts with JWT-based sessions and integrated Google OAuth for seamless login.
- **Modern UI:** A clean, responsive dashboard built with React and Tailwind CSS.

---

## 🛠 Tech Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** [MongoDB](https://www.mongodb.com/) (with Motor async driver)
- **Face Recognition:** [DeepFace](https://github.com/serengil/deepface) & [RetinaFace](https://github.com/serengil/retinaface)
- **Authentication:** JWT, Bcrypt, Authlib (Google OAuth)

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 💻 Local Setup & Running

### Prerequisites
- **Python:** 3.14+
- **Node.js:** Latest LTS (with Yarn)
- **MongoDB:** Running locally on port `27017`

---

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory:
    ```env
    MONGO_URL=mongodb://localhost:27017
    DB_NAME=missing_child_db
    JWT_SECRET=your_jwt_secret_key
    CORS_ORIGINS=http://localhost:3000
    ```

5.  **Run the Backend Server:**
    ```bash
    uvicorn server:app --reload
    ```
    The API will be available at `http://localhost:8000`.

---

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `frontend/` directory:
    ```env
    REACT_APP_BACKEND_URL=http://localhost:8000
    ```

4.  **Run the Frontend Server:**
    ```bash
    yarn start
    ```
    The application will be accessible at `http://localhost:3000`.

---

## 🛡 Google OAuth (Sign in with Google)

To enable Google Sign-In, follow these steps:

1.  **Google Cloud Console:** Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **OAuth consent screen:** Set up an External consent screen.
3.  **Create Credentials:** Create an **OAuth client ID** for a "Web application".
    - **Authorized JavaScript origins:** `http://localhost:3000`
4.  **Update Frontend Env:** Add your Client ID to `frontend/.env`:
    ```env
    REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
    ```
5.  **Restart Frontend:** Restart the React dev server to pick up the changes.

---

## 🧪 Testing

A functional test suite for the backend API is available in the root directory:
```bash
python backend_test.py
```
This script tests registration, search, and API health.
