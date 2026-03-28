const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

// helpers
const signToken = (user) => {
    return jwt.sign(
        {id: user._id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
}

const userPayLoad = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency
});


const registerUser = async (req,res) => {
    try {
        const {name, email, password, confirmPassword} = req.body;

        if(!name || !email || !password || !confirmPassword){
            return res.status(400).json({
                message: "All the fields are required."
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                message: "Password must be of 6 charachters long."
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                message: "Password didn't match."
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase()});

        if(existing){
            return res.status(400).json({
                message: "email already registered."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, passwordHash});
        const token = signToken(user);

        res.status(201).json({ token, user: userPayLoad(user)});
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message});
    }
};


const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: 'email and password are required.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase()});
        if(!user){
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = signToken(user);
        res.json({ token, user: userPayLoad(user) });
    } catch (err) {
        return res.status(500).json({ message: 'server error', error: err.message});
    }
};

const getMe = async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if(!user){
            return res.status(404).json({
                message: "User not find in the database."
            });
        }
        res.json(userPayLoad(user));
    } catch (err) {
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
}