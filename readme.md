## Deployment

The application is deployed and accessible at the following link:

[https://jigyasa-psi.vercel.app/](https://jigyasa-psi.vercel.app/)

# Jigyasa Application

Jigyasa is a survey management and analysis platform that allows users to create, manage, and analyze surveys. The application is built with a React-based frontend and a Django backend.

## Features

### Frontend
- **Authentication**: User login and registration with JWT-based authentication.
- **Survey Management**: Create, edit, and view surveys.
- **Survey Responses**: Submit and view survey responses.
- **Notifications**: View organization-related notifications.
- **Survey Analysis**: Upload CSV files and perform data analysis with visualizations.
- **Profile Management**: Manage user profiles and organization details.

### Backend
- **User Management**: Custom user model with organization and profile support.
- **Survey API**: Endpoints for creating, updating, and retrieving surveys and responses.
- **CSV Uploads**: Upload and process CSV files for analysis.
- **Data Analysis**: Generate plots and perform group-by operations on survey data.

---

## Project Structure

### Frontend
Located in the `FrontEnd` folder:
- **Framework**: React with Vite for fast development.
- **Styling**: TailwindCSS for responsive design.
- **Routing**: React Router for navigation.
- **State Management**: Context API for authentication and global state.

Key files and folders:
- `src/pages`: Contains pages like `Dashboard`, `SurveyAnalyzer`, `ProfilePage`, etc.
- `src/components`: Reusable components like `LoginForm`, `ProfileCard`, etc.
- `.env`: Configuration for backend API URL.

### Backend
Located in the `BackEnd` folder:
- **Framework**: Django with Django REST Framework for API development.
- **Database**: SQLite for development (can be replaced with other databases in production).
- **Authentication**: JWT-based authentication using `rest_framework_simplejwt`.

Key files and folders:
- `jigyasa`: Core app for user and survey management.
- `survey_analyzer`: App for CSV uploads and data analysis.
- `uploads/csv`: Directory for storing uploaded CSV files.

---

## Installation

### Prerequisites
- Node.js and npm
- Python 3.x and pip
- Virtual environment (optional)

### Frontend Setup
1. Navigate to the `FrontEnd` directory:
   ```bash
   cd FrontEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `BackEnd` directory:
   ```bash
   cd BackEnd
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

---

## Running the Application
1. Ensure both the frontend and backend servers are running.
2. Open the frontend development server URL (usually `http://localhost:5173`) in your browser.
3. Use the application to create surveys, analyze data, and manage profiles.

---

## Contributing
1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push to your fork.
4. Submit a pull request for review.

---