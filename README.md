# Smart Monthly Budget Planner

A full-stack web application that helps users manage their monthly finances by tracking income and expenses, setting category-wise budgets, monitoring spending, and visualizing financial summaries through interactive charts.

## Features

- **Dashboard:** View monthly income, expenses, balance, and budget summaries.
- **Transaction Management:** Add and delete income and expense transactions.
- **Budget Management:** Create and delete monthly budgets for different expense categories.
- **Expense Tracking:** Monitor spending across categories such as Food, Travel, Shopping, Bills, Education, Healthcare, and Entertainment.
- **Interactive Charts:** Visualize expense distribution and compare income with expenses.
- **Monthly Summary:** Review financial activity for a selected month and year.
- **Data Persistence:** Store transactions and budgets in MongoDB Atlas.
- **Responsive Interface:** Access the dashboard on desktop and mobile screens.

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- **CSS**
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- **REST** **API**

**Database**
- MongoDB Atlas
- Mongoose

**Tools**
- Visual Studio Code
- Git
- GitHub
- npm

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account
- Git

## Installation and Setup

### 1. Clone the Repository

```bash git clone [https://github.com/ramanji13/Smart-Monthly-Budget-Planner.git](https://github.com/ramanji13/Smart-Monthly-Budget-Planner.git) cd Smart-Monthly-Budget-Planner ```

### 2. Configure MongoDB

Create a `.env` file inside the `server` folder and add your MongoDB Atlas connection string.

```env **PORT**=**5000** MONGODB_URI=your_mongodb_atlas_connection_string ```

Replace the placeholder with your actual connection string. Never upload your `.env` file or expose database credentials publicly.

### 3. Install Backend Dependencies

```bash cd server npm install cd .. ```

### 4. Install Frontend Dependencies

```bash cd client npm install cd .. ```

### 5. Run the Application

From the main project folder, execute:

```bash npm start ```

This command builds the React frontend and starts the Express backend.

Open the application in your browser:

[http://localhost:**5000**](http://localhost:**5000**)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server and database status |
| GET | `/api/transactions` | Retrieve transactions |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budgets` | Retrieve budgets |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |
| GET | `/api/summary?month=10&year=2026` | Retrieve a monthly summary |

## Learning Outcomes

This project demonstrates practical knowledge of:

- Full-stack web application development
- Building RESTful APIs using Node.js and Express
- Developing reusable interfaces with React
- Database modeling and **CRUD** operations using MongoDB and Mongoose
- Connecting frontend and backend services
- Data visualization using charts
- Version control and source code management using Git and GitHub

## Future Enhancements

- User registration and secure authentication
- Separate financial data for each user
- Transaction editing and advanced filtering
- Export reports to **CSV** or **PDF**
- Smart spending insights and savings recommendations
- Deployment to a cloud hosting platform

## Repository

GitHub: [https://github.com/ramanji13/Smart-Monthly-Budget-Planner](https://github.com/ramanji13/Smart-Monthly-Budget-Planner)

## License

This project is intended for educational and portfolio purposes. A license can be added if you choose to distribute or reuse the project under specific terms.
