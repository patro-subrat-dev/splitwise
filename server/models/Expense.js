const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please enter expense description'],
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please enter expense amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY']
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splitBetween: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paid: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    default: Date.now
  },
  receipt: {
    type: String, // URL to receipt image
    default: ''
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate total amount owed by each person
expenseSchema.methods.calculateBalances = function() {
  const balances = {};
  
  this.splitBetween.forEach(split => {
    const userId = split.user.toString();
    if (!balances[userId]) {
      balances[userId] = { owed: 0, paid: 0 };
    }
    balances[userId].owed += split.amount;
  });
  
  // Add to paid amount for the person who paid
  const paidById = this.paidBy.toString();
  if (!balances[paidById]) {
    balances[paidById] = { owed: 0, paid: 0 };
  }
  balances[paidById].paid += this.amount;
  
  return balances;
};

module.exports = mongoose.model('Expense', expenseSchema);
