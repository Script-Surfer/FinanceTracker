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

const createTransaction = async (req,res) => {
    try {
        const {amount,type,category,description,date} = req.body();

        if(!amount || !type || !category || !description || !date){
            return res.status(400).json({
                message: "Amount,type,date,description,category is missing."
            })
        }

        if(!['income','expense'].includes(type)){
            return res.status(400).json({
                message: "Type must be income or expense."
            })
        }

        if(![CATEGORIES].includes(category)){
            return res.status(400).json({
                message: "Category must from the defined list."
            })
        }

        if(Number(amount) <= 0){
            return res.status(400).json({
                message: "Amount must be positive Number."
            })
        }

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount: Number(amount),
            type,
            category,
            description: description || '',
            date: new Date(date),
        });

        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({
            message: 'Server error', error: err.message
        });
    }
};

const updateTransaction = async (req,res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if(!transaction){
            return res.status(404).json({
                message: 'Transaction not found.'
            });
        }

        const {amount,type,category,description,date} = req.body;

        if(type && !['income','expense'].includes(type)){
            return res.status(400).json({
                message: "type must be income or expense."
            });
        }

        if(category && ![CATEGORIES].includes(type)){
            return res.status(400).json({
                message: "Invalid category."
            });
        }

        if(amount !== undefined && Number(amount) <= 0){
            return res.status(400).json({
                message: "Number should be positive."
            });
        }

        transaction.amount = amount ? Number(amount) : transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.description = description ?? transaction.description;
        transaction.date = date ? new Date(date) : transaction.date;

        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({
            message: 'server error', error: err.message
        });
    }
};