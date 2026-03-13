# Splitwise Clone

A full-stack expense splitting application built with React, Node.js, Express, and MongoDB. This is a clone of Splitwise that allows users to create groups, add expenses, and track balances with friends.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Group Management**: Create groups, add/remove members
- **Expense Tracking**: Add expenses with custom splits between group members
- **Balance Calculation**: Automatic balance calculations showing who owes whom
- **Real-time Updates**: Socket.io integration for real-time expense updates
- **User Search**: Find and add friends to split expenses with
- **Multiple Currencies**: Support for different currencies
- **Expense Categories**: Categorize expenses for better organization

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API calls
- Socket.io-client for real-time updates

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time communication
- bcryptjs for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd splitwise
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/splitwise
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the `MONGODB_URI` to use MongoDB Atlas.

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Groups
- `GET /api/groups` - Get all user groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get specific group details
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member from group

### Expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/group/:groupId` - Get group expenses
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/balances/:groupId` - Get group balances

### Users
- `GET /api/users/search` - Search users by name/email
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/friends` - Add friend
- `DELETE /api/users/friends/:friendId` - Remove friend
- `GET /api/users/friends` - Get friends list

## Database Schema

### User
- name: String
- email: String (unique)
- password: String (hashed)
- avatar: String
- phoneNumber: String
- friends: [ObjectId] (ref: User)
- groups: [ObjectId] (ref: Group)

### Group
- name: String
- description: String
- creator: ObjectId (ref: User)
- members: [{ user: ObjectId (ref: User), joinedAt: Date }]
- expenses: [ObjectId] (ref: Expense)

### Expense
- description: String
- amount: Number
- currency: String
- paidBy: ObjectId (ref: User)
- group: ObjectId (ref: Group)
- splitBetween: [{ user: ObjectId (ref: User), amount: Number, paid: Boolean }]
- category: String
- date: Date
- notes: String

## Real-time Features

The application uses Socket.io for real-time updates:
- Expense additions/updates/deletions
- Member additions/removals from groups
- Balance updates

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Groups**: Create groups to organize expenses with different sets of people
3. **Add Members**: Search and add friends to your groups
4. **Add Expenses**: Add expenses and split them between group members
5. **Track Balances**: View who owes whom in each group
6. **Real-time Updates**: See expense updates in real-time when other group members add expenses

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run install-deps` - Install dependencies for both root and client

### Project Structure

```
splitwise/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Socket)
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   └── index.js           # Server entry point
├── .env                   # Environment variables
├── package.json           # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
