import { useState, useCallback, useEffect, useTransition } from "react";
import Navbar from '../components/Navbar';
import api from '../api/axios';

const CATEGORIES = [
        'Food','Rent','Transport','Shopping','Entertainment',
        'Utilities','Health','Education','Salary','Freelance','Other'
    ];

const EMPTY_FORM = {
    amount = '',
    type: 'expense',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
};

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [landing, setLanding] = useState(false);

    
}

