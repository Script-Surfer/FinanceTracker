const Budget = require("../models/budget.models");
const Transaction = require('../models/transactions.models');

const getBudgets = async (req,res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const budget = await Budget.find({ userId: req.user.id, month,year});

        const start = new Date(year, month -1,1);
        const end = new Date(year,month,0);

        const spending = await Transaction.aggregate([
            {
                $match: {
                    userId: req.user.id,
                    type: 'expense',
                    date: {$gte: start, $lte: end},
                },
            },
            {
                $group: {
                    _id: '$category',
                    spent: {$sum: '$amount'},
                },
            },
        ]);

        const spendingMap = {};
        spending.forEach(s => { spendingMap[s._id] = s.spent; });

        const result = budgets.map(b => ({
        _id:         b._id,
        category:    b.category,
        limitAmount: b.limitAmount,
        spent:       spendingMap[b.category] || 0,
        month:       b.month,
        year:        b.year,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}
