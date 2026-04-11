const Transaction = require('../models/transactions.models');

const CATEGORIES = [
    'Food','Rent','Transport','Shopping','Entertainment',
    'Utilities','Health','Education','Salary','Freelance','Other'
];

const getTransactions = async (req,res) => {
    try {
        const { type, category, search, from, to , page=1, limit=10} = req.query;

        const query = { userId: req.user.id };

        if(type) query.type = type;
        if(category) query.category = category;

        if(from || to){
            query.date = {};
            if(from) query.date.$gte = new Date(from);
            if(to) query.date.$lte = new Date(to);
        }

        if(search) query.description = { $regex: search, $options: 'i'};

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction
            .find(query)
            .sort({ date: -1})
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            transactions,
            total,
            page: Number(page),
            totalPages: Math.ceil(total/limit),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};