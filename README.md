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
## Detailed Description

# 🎯 Main Purpose
Splitwise is an expense-splitting application designed to help friends, roommates, and groups fairly divide costs and track who owes whom money.

# 💡 Core Functionality
1. Expense Sharing
Split bills among multiple people
Track shared expenses like rent, utilities, dinners, trips
Calculate fair splits based on who paid what

2. Balance Management
Automatic calculations of who owes whom
Simplify debts by combining multiple transactions
Settle up easily with payment integrations

3. Group Organization
Create groups for different situations (roommates, travel buddies, family)
Add members and manage group expenses
Track spending patterns over time

🏠 Common Use Cases

# Roommates & Households
Rent and utility bills
Groceries and household supplies
Shared furniture or appliances
# Friends & Social
Restaurant bills and bar tabs
Concert tickets and events
Group gifts and celebrations
# Travel & Vacations
Hotel accommodations
Transportation costs
Group activities and meals
# Family & Couples
Family vacations
Shared household expenses
Parent-child expense tracking
# 🔧 Key Benefits

* Financial Clarity
No more confusion about who paid what
Clear records of all shared expenses
Fair distribution of costs
* Relationship Protection
Avoid awkward money conversations
Transparent tracking prevents misunderstandings
Maintain friendships while managing finances
* Convenience
Mobile app for on-the-go tracking
Automatic reminders for payments
Multiple payment methods (Venmo, PayPal, etc.)

* 📊 How It Works
1. Add Expense
Example: Dinner for 4 people - $200 total
- Person A paid: $200
- Split between: A, B, C, D
- Each person owes: $50
- A's balance: +$150 (owed to them)
- B, C, D's balance: -$50 each (they owe)
2. Track Balances
Green numbers = Someone owes you money
Red numbers = You owe someone money
Zero balance = All settled up
3. Settle Up
Payment reminders sent to debtors
Mark as paid when transactions complete
Simplify debts by combining multiple people
* 🌟 Real-World Example
Scenario: 4 roommates sharing expenses

Monthly Expenses:

Rent: $2,000 (split 4 ways = $500 each)
Utilities: $200 (split 4 ways = $50 each)
Groceries: $400 (Person A paid for everyone)
Calculations:

Person A: Paid $400 groceries + $550 rent/utilities = $950
Person B: Paid $550 rent/utilities = $550
Person C: Paid $550 rent/utilities = $550
Person D: Paid $550 rent/utilities = $550
Result:

Person A is owed $400 by the group
Persons B, C, D each owe $133.33 to Person A
💼 Business Applications
Professional Use Cases
Startup teams sharing office costs
Project groups managing shared resources
Freelance collaborations tracking expenses
Non-profit organizations managing shared costs

* 🚀 Why People Use Splitwise
Problem Solving
Eliminates spreadsheets and manual calculations
Reduces conflicts over money
Simplifies complex group finances
Provides documentation for shared expenses
Modern Solution
Digital tracking replaces paper notes
Automated calculations prevent errors
Mobile access for convenience
Integration with payment platforms
* 📈 Impact
Splitwise has helped millions of people manage billions of dollars in shared expenses, making it easier to maintain healthy relationships while handling financial responsibilities together.

In simple terms: Splitwise is like a digital accountant for shared expenses - it keeps track of who paid for what and calculates who owes whom, so friends and groups can split costs fairly without awkward conversations or complicated math! 🧮💰


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
