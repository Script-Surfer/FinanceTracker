import { useState, useCallback, useEffect, useTransition } from "react";
import Navbar from '../components/Navbar';
import api from '../api/axios';

const CATEGORIES = [
    'Food', 'Rent', 'Transport', 'Shopping', 'Entertainment',
    'Utilities', 'Health', 'Education', 'Salary', 'Freelance', 'Other'
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
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: '', category: '', search: '', form: '', to: '',
    });

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    // ── fetch ────────────────────────────────────────────────
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10, ...filters };

            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const { data } = await api.get('/transactions', { params });
            setTransactions(data.transactions);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    // ── filter handlers ───────────────────────────────────────
    const handleFilter = (e) => {
        setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
        setPage(1);
    };
    const clearFilters = () => {
        setFilters({ type: '', category: '', search: '', from: '', to: '' });
        setPage(1);
    };

    // ── modal helpers ─────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = () => {
        setEditTarget(tx);
        setForm({
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            description: tx.description,
            date: tx.date.split('T')[0],
        });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditTarget(null);
    };

    // ── submit ────────────────────────────────────────────────
    const handleSubmit = async () => {
        e.preventDefault();
        try {
            if (editTarget) {
                await api.put(`/transactions/${editTarget._id}`, form);
            } else {
                await api.post('/transactions', form);
            }
            closeModal();
            fetchTransactions();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Something went wrong');
        }
    };

    // ── delete ────────────────────────────────────────────────
    const handleDelete = async () => {
        try {
            await api.delete(`/transactions/${deleteId}`);
            setDeleteId(null);
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Navbar />
            <div style={s.container}>

                {/* ── header ── */}
                <div style={s.pageHeader}>
                    <div>
                        <h2 style={s.pageTitle}>Transactions</h2>
                        <p style={s.pageSub}>{total} total records</p>
                    </div>
                    <button onClick={openAdd} style={s.primaryBtn}>+ Add transaction</button>
                </div>

                {/* ── filters (PRD § 4.3) ── */}
                <div style={s.filterBar}>
                    <input name="search" placeholder="Search description…"
                        value={filters.search} onChange={handleFilter} style={s.filterInput} />
                    <select name="type" value={filters.type} onChange={handleFilter} style={s.filterSelect}>
                        <option value="">All types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <select name="category" value={filters.category} onChange={handleFilter} style={s.filterSelect}>
                        <option value="">All categories</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input name="from" type="date" value={filters.from}
                        onChange={handleFilter} style={s.filterInput} />
                    <input name="to" type="date" value={filters.to}
                        onChange={handleFilter} style={s.filterInput} />
                    <button onClick={clearFilters} style={s.ghostBtn}>Clear</button>
                </div>

                {/* ── table ── */}
                <div style={s.card}>
                    {loading ? (
                        <p style={{ padding: 24, color: '#888' }}>Loading…</p>
                    ) : transactions.length === 0 ? (
                        <p style={{ padding: 24, color: '#888' }}>No transactions found.</p>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr style={s.theadRow}>
                                    {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx._id} style={s.tr}>
                                        <td style={s.td}>{new Date(tx.date).toLocaleDateString()}</td>
                                        <td style={s.td}>{tx.description || '—'}</td>
                                        <td style={s.td}><span style={s.catBadge}>{tx.category}</span></td>
                                        <td style={s.td}>
                                            <span style={{ ...s.typeBadge, background: tx.type === 'income' ? '#dcfce7' : '#fee2e2', color: tx.type === 'income' ? '#166534' : '#991b1b' }}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{ ...s.td, fontWeight: 500, color: tx.type === 'income' ? '#166534' : '#991b1b' }}>
                                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </td>
                                        <td style={s.td}>
                                            <button onClick={() => openEdit(tx)} style={s.actionBtn}>Edit</button>
                                            <button onClick={() => setDeleteId(tx._id)} style={{ ...s.actionBtn, color: '#dc2626', marginLeft: 6 }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── pagination ── */}
                {totalPages > 1 && (
                    <div style={s.pagination}>
                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={s.pageBtn}>← Prev</button>
                        <span style={{ fontSize: 13, color: '#555' }}>Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={s.pageBtn}>Next →</button>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ── */}
            {showModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <h3 style={s.modalTitle}>{editTarget ? 'Edit transaction' : 'Add transaction'}</h3>
                        {formError && <div style={s.errorBox}>{formError}</div>}
                        <form onSubmit={handleSubmit}>
                            <FormRow label="Amount">
                                <input type="number" value={form.amount} min="0.01" step="0.01" required
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={s.input} />
                            </FormRow>
                            <FormRow label="Type">
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={s.input}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </FormRow>
                            <FormRow label="Category">
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={s.input}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Description">
                                <input type="text" value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={s.input} />
                            </FormRow>
                            <FormRow label="Date">
                                <input type="date" value={form.date} required
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={s.input} />
                            </FormRow>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="submit" style={s.primaryBtn}>
                                    {editTarget ? 'Save changes' : 'Add transaction'}
                                </button>
                                <button type="button" onClick={closeModal} style={s.ghostBtn}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete confirm dialog (PRD § 4.3) ── */}
            {deleteId && (
                <div style={s.overlay}>
                    <div style={{ ...s.modal, maxWidth: 360 }}>
                        <h3 style={s.modalTitle}>Delete transaction?</h3>
                        <p style={{ color: '#555', fontSize: 14 }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={handleDelete} style={{ ...s.primaryBtn, background: '#dc2626' }}>Delete</button>
                            <button onClick={() => setDeleteId(null)} style={s.ghostBtn}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormRow = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#444' }}>{label}</label>
        {children}
    </div>
);

// ── styles ────────────────────────────────────────────────
const s = {
    container: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    pageTitle: { margin: 0, fontSize: 22, fontWeight: 600 },
    pageSub: { margin: '4px 0 0', fontSize: 13, color: '#888' },
    filterBar: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    filterInput: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' },
    filterSelect: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, background: '#fff' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    theadRow: { background: '#f8f9fa' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #e5e5e5' },
    tr: { borderBottom: '1px solid #f0f0f0' },
    td: { padding: '13px 16px', fontSize: 14, color: '#333' },
    catBadge: { background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 20, fontSize: 12 },
    typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
    actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#2563eb', padding: '2px 4px' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 },
    pageBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 600 },
    input: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
    primaryBtn: { padding: '9px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
    ghostBtn: { padding: '9px 18px', borderRadius: 8, border: '1px solid #ddd', background: 'transparent', fontSize: 14, cursor: 'pointer', color: '#555' },
    errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
};

export default TransactionsPage;


