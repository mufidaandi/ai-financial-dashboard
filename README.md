<div>
  <img src="client/public/dark-mode.png" alt="ExpenSure Logo" height="80">
  <h1>AI Financial Dashboard 💰</h1>
</div>

A comprehensive personal finance management application with AI-powered insights and recommendations. Track your expenses, manage accounts, and get intelligent financial advice powered by Google's Gemini AI.

![Financial Dashboard](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## ✨ Features

### 🏠 **Dashboard Overview**
- Real-time financial metrics (Total Available, Expenses, Balance)
- Interactive spending breakdown with pie charts
- Recent transactions overview with adaptive layout
- **Budget Progress Cards** with visual progress indicators
- AI-powered financial recommendations
- Payment reminders for credit cards
- **Fully mobile responsive** with adaptive grid layouts

### 💳 **Transaction Management**
- Add, edit, and delete transactions (Income, Expense, Transfer)
- AI-powered category suggestions based on transaction descriptions
- Advanced filtering and search capabilities
- Bulk operations and inline editing
- Monthly/custom date range filtering
- **Mobile-optimized table** with horizontal scrolling
- **Responsive design** for all screen sizes

### � **Budget Management**
- **Create and manage budgets** by category and time period
- **Real-time budget tracking** with automatic spending calculations
- **Visual progress indicators** with color-coded status
- **Smart status system**: On Track → Warning → Alert → At Limit → Over Budget
- **Monthly and custom period** budget cycles
- **Budget progress cards** integrated into dashboard
- **Mobile-responsive** budget management interface

### �🏦 **Account Management**
- Support for multiple account types (Checking, Savings, Credit Card, Investment)
- Automatic balance updates based on transactions
- Credit card payment due date tracking
- Account-specific transaction filtering

### 📊 **Categories & Insights**
- Customizable expense categories
- AI-suggested categories for new transactions
- Spending pattern analysis
- **Enhanced AI Insights** with comprehensive financial analysis
- Monthly/yearly financial insights
- **Mobile-responsive insights** with adaptive charts

### 👤 **User Profile & Authentication**
- **Complete profile management** with name and email updates
- **Secure password change** functionality
- **Forgot password feature** with direct reset (no email required)
- **Mobile-accessible profile settings** via sidebar
- JWT-based secure authentication
- Separate desktop header and mobile sidebar user interfaces

### 🤖 **AI-Powered Features**
- Automatic transaction categorization
- **Comprehensive spending insights** with financial health scoring
- **Smart recommendations** based on spending patterns
- Spending behavior analysis
- Budget optimization suggestions
- **Enhanced AI analysis** with priority-based recommendations

### 📱 **Mobile Experience**
- **Fully responsive design** across all devices
- **Mobile-first approach** with touch-friendly interfaces
- **Adaptive layouts** that stack vertically on mobile
- **Horizontal table scrolling** for data-heavy views
- **Mobile-optimized sidebar** with user profile access
- **Responsive typography** that scales with screen size
- **Touch-friendly buttons** and form elements

### ⚙️ **Settings & Customization**
- Currency formatting preferences
- **Dark/light theme support** with toggle in header/sidebar
- **Comprehensive user profile management**
- **Password reset functionality**
- Secure authentication with JWT

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful components library built on Radix UI
- **Lucide React** - Beautiful icons
- **Recharts** - Interactive charts and graphs
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Google Gemini AI** - AI-powered insights
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Google AI API key

### Installation

1. **Clone the ExpenSure repository**
   ```bash
   git clone https://github.com/mufidaandi/ai-financial-dashboard.git
   cd ai-financial-dashboard
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

5. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/financial-dashboard
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Google AI
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

6. **Start the development servers**
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   node src/server.js
   ```
   
   **Terminal 2 - Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```

7. **Access ExpenSure**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
ai-financial-dashboard/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Design system components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Application pages/routes
│   │   │   ├── Dashboard.jsx    # Main dashboard with budget cards
│   │   │   ├── Transactions.jsx # Transaction management
│   │   │   ├── Budgets.jsx      # Budget management
│   │   │   ├── Profile.jsx      # User profile settings
│   │   │   ├── ForgotPassword.jsx # Password reset
│   │   │   └── Insights.jsx     # AI insights
│   │   ├── services/       # API service layers
│   │   │   └── budgetService.js # Budget API calls
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   │   ├── budgetController.js # Budget management logic
│   │   │   └── aiController.js     # AI insights logic
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   │   ├── Budget.js   # Budget model with progress virtuals
│   │   │   └── User.js     # User model
│   │   ├── routes/         # API routes
│   │   │   ├── budgetRoutes.js # Budget API endpoints
│   │   │   └── authRoutes.js   # Auth & profile endpoints
│   │   └── utils/          # Server utilities
│   └── package.json
└── package.json           # Root package configuration
```

## 🔧 Available Scripts

### Root Level
```bash
npm install          # Install all dependencies
```

### Client (Frontend)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Server (Backend)
```bash
node src/server.js   # Start the server
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Reset password
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change user password

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets with progress tracking
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/progress` - Get budget progress for dashboard

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### AI Features
- `POST /api/ai/suggest-category` - Get AI category suggestion
- `GET /api/ai/insights` - Get comprehensive spending insights and recommendations

## 🎨 Key Features in Detail

### **Budget Management System**
- **Smart Budget Creation**: Set budgets by category
- **Real-time Progress Tracking**: Automatic calculation of spent amounts from transactions
- **Intelligent Status System**: 
  - 🟢 On Track (< 50% spent)
  - 🟡 Warning (50-75% spent)  
  - 🟠 Alert (75-99% spent)
  - 🔵 At Limit (exactly 100% spent)
  - 🔴 Over Budget (> 100% spent)
- **Dashboard Integration**: Budget progress cards with visual indicators
- **Mobile Responsive**: Optimized for all screen sizes

### **Enhanced Mobile Experience**
- **Responsive Design**: Mobile-first approach with breakpoints (sm, md, lg)
- **Adaptive Layouts**: Content stacks vertically on mobile, arranges horizontally on desktop
- **Touch-Friendly Interface**: Proper button sizes and spacing for mobile interaction
- **Mobile Sidebar**: Profile settings and logout accessible on mobile
- **Desktop Header**: Clean user dropdown with profile access on desktop
- **Horizontal Scrolling**: Tables scroll horizontally on mobile for data-heavy views

### **User Profile & Security**
- **Complete Profile Management**: Update name, email, and account information
- **Secure Password Management**: Change password with current password verification
- **Forgot Password Feature**: Direct password reset (email + new password form)
- **JWT Authentication**: Secure token-based authentication system
- **Dual Interface**: Mobile sidebar profile vs desktop header dropdown

### **AI-Powered Transaction Categorization**
- Automatically suggests categories when you enter transaction descriptions
- Learns from your past categorization patterns
- Supports confidence levels (high, medium, low)

### **Enhanced AI Insights**
- **Financial Health Scoring**: Comprehensive analysis of spending patterns
- **Smart Recommendations**: Priority-based suggestions (high, medium, low)
- **Spending Analysis**: Detailed breakdown of financial behavior
- **Mobile Optimized**: Responsive charts and layouts for all devices

### **Smart Payment Reminders**
- Tracks credit card due dates
- Shows reminders 7 days before payment due
- Monthly dismissal system
- Priority-based color coding

### **Advanced Filtering & Search**
- Filter by month, category, account, type, and amount range
- Real-time search across all transaction fields
- Sortable columns with ascending/descending order
- Pagination for large transaction sets

### **Automatic Balance Management**
- Account balances update automatically with transactions
- Support for transfers between accounts
- Real-time balance calculations
- Transaction type validation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🚀 Deployment

### Deploy to Vercel

This project is optimized for deployment on Vercel with the following setup:

#### **Backend Deployment:**

1. **Set up MongoDB Atlas** (Production Database):
   ```bash
   # Sign up at https://cloud.mongodb.com/
   # Create a new cluster
   # Get your connection string
   ```

2. **Deploy Backend to Vercel:**
   ```bash
   # From your project root
   cd server
   vercel --prod
   
   # Or connect GitHub repo in Vercel dashboard
   # Point to /server directory as root
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial-dashboard
   JWT_SECRET=your-production-jwt-secret-here
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   NODE_ENV=production
   ```

#### **Frontend Deployment:**

1. **Update API URLs** in client:
   ```javascript
   // client/src/services/api.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend.vercel.app'
     : 'http://localhost:3000';
   ```

2. **Deploy Frontend to Vercel:**
   ```bash
   # From your project root
   cd client
   vercel --prod
   
   # Or connect GitHub repo in Vercel dashboard
   # Point to /client directory as root
   ```

3. **Configure Build Settings** in Vercel:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### **Alternative: Deploy Both from Root**

You can also deploy both frontend and backend from the root directory:

1. **Create `vercel.json` in root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "client/dist"
         }
       },
       {
         "src": "server/src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/src/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "client/dist/$1"
       }
     ]
   }
   ```

2. **Update package.json scripts in root:**
   ```json
   {
     "scripts": {
       "build": "cd client && npm run build",
       "start": "cd server && npm start"
     }
   }
   ```

### **Quick Deployment Steps:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: add vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Update CORS in server** for production:
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://your-frontend.vercel.app'
   ];
   ```

### **Environment Variables Needed:**

#### Backend (.env):
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
GOOGLE_AI_API_KEY=your-api-key
NODE_ENV=production
```

#### Frontend (.env):
```env
VITE_API_URL=https://your-backend.vercel.app
```

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the AI features
- [shadcn/ui](https://ui.shadcn.com/) for beautiful and accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons
- [Recharts](https://recharts.org/) for data visualization

## 📧 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

<div align="center">
  <img src="client/public/logo-icon.png" alt="ExpenSure Logo" width="24" height="24">
  <strong>ExpenSure - Built with ❤️ for better financial management</strong>
</div>