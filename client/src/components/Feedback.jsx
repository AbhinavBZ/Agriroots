import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'General', 'Crop Help', 'Market', 'Weather', 'Suggestion', 'Bug'];
const PAGE_SIZE = 6;

const categoryMeta = {
    All:        { icon: 'fa-comments',       color: '#4caf50' },
    General:    { icon: 'fa-comment-dots',   color: '#4caf50' },
    'Crop Help':{ icon: 'fa-seedling',       color: '#8bc34a' },
    Market:     { icon: 'fa-chart-line',     color: '#ff9800' },
    Weather:    { icon: 'fa-cloud-sun-rain', color: '#03a9f4' },
    Suggestion: { icon: 'fa-lightbulb',      color: '#9c27b0' },
    Bug:        { icon: 'fa-bug',            color: '#f44336' },
};

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function StarRating({ value, onChange, readonly = false }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="fb-stars" role="group" aria-label="Star rating">
            {[1,2,3,4,5].map(star => (
                <i
                    key={star}
                    className={`fa-${(hover || value) >= star ? 'solid' : 'regular'} fa-star fb-star`}
                    style={{ color: (hover || value) >= star ? '#ffc107' : '#ccc', cursor: readonly ? 'default' : 'pointer' }}
                    onClick={() => !readonly && onChange && onChange(star === value ? 0 : star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    aria-label={`${star} star`}
                />
            ))}
        </div>
    );
}

function Avatar({ name, image, size = 44 }) {
    const initials = (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const colors = ['#4caf50','#388e3c','#8bc34a','#ff9800','#f44336','#9c27b0','#03a9f4','#ff5722'];
    const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
    if (image) return (
        <img src={image} alt={name} className="fb-avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
    return (
        <div className="fb-avatar" style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
            {initials}
        </div>
    );
}

function ReplyForm({ parentId, onReplyAdded, onCancel }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const ref = useRef(null);
    useEffect(() => { ref.current?.focus(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (text.trim().length < 3) { setError('Reply must be at least 3 characters.'); return; }
        setLoading(true); setError('');
        try {
            const reply = await api.feedback.reply(parentId, text.trim());
            onReplyAdded(reply);
            setText('');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <form className="fb-reply-form" onSubmit={submit}>
            <textarea
                ref={ref}
                className="fb-reply-input"
                rows={2}
                placeholder="Write a reply…"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={500}
            />
            {error && <p className="fb-error-inline">{error}</p>}
            <div className="fb-reply-actions">
                <button type="submit" className="fb-btn-reply-submit" disabled={loading}>
                    {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <><i className="fa-solid fa-paper-plane" /> Reply</>}
                </button>
                <button type="button" className="fb-btn-cancel" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

function CommentCard({ comment, currentUser, onDelete, onLike, onAuthRequired }) {
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [localLikes, setLocalLikes] = useState(comment.likes || 0);
    const [liking, setLiking] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);
    const catMeta = categoryMeta[comment.category] || categoryMeta['General'];

    const handleLike = async () => {
        if (!currentUser) { onAuthRequired(); return; }
        if (liking) return;
        setLiking(true);
        try {
            const res = await api.feedback.like(comment.id);
            setLocalLikes(res.likes);
            onLike(comment.id, res.likes);
        } catch (err) { console.error('Like error:', err); } finally { setLiking(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        setDeleting(true);
        try { await api.feedback.delete(comment.id); onDelete(comment.id); }
        catch (err) { alert(err.message); setDeleting(false); }
    };

    const handleReplyAdded = (reply) => {
        setReplies(prev => [...prev, reply]);
        setShowReplyForm(false);
        setShowReplies(true);
    };

    const isOwner = currentUser && currentUser.id === comment.user_id;

    return (
        <div className="fb-card" id={`comment-${comment.id}`}>
            <div className="fb-card-top">
                <Avatar name={comment.fullName} image={comment.profileImage} size={48} />
                <div className="fb-card-meta">
                    <div className="fb-card-header-row">
                        <div>
                            <span className mobileName="fb-author">{comment.fullName}</span>
                            {comment.membershipType === 'Premium' && (
                                <span className="fb-premium-badge"><i className="fa-solid fa-crown" /> Premium</span>
                            )}
                            <span
                                className="fb-category-tag"
                                style={{ background: catMeta.color + '18', color: catMeta.color, borderColor: catMeta.color + '44' }}
                            >
                                <i className={`fa-solid ${catMeta.icon}`} /> {comment.category}
                            </span>
                        </div>
                        {comment.rating > 0 && <StarRating value={comment.rating} readonly />}
                    </div>
                    <span className="fb-time">{timeAgo(comment.created_at)}</span>
                </div>
                {isOwner && (
                    <button
                        className="fb-delete-btn"
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label="Delete comment"
                        title="Delete"
                    >
                        {deleting ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-trash-can" />}
                    </button>
                )}
            </div>

            <p className="fb-message">{comment.message}</p>

            <div className="fb-actions">
                <button className={`fb-action-btn ${liking ? 'loading' : ''}`} onClick={handleLike} aria-label="Like">
                    <i className="fa-solid fa-thumbs-up" /> <span>{localLikes}</span>
                </button>
                <button
                    className="fb-action-btn"
                    onClick={() => { if (!currentUser) { onAuthRequired(); return; } setShowReplyForm(v => !v); }}
                    aria-label="Reply"
                >
                    <i className="fa-solid fa-reply" /> Reply
                </button>
                {replies.length > 0 && (
                    <button className="fb-action-btn accent" onClick={() => setShowReplies(v => !v)} aria-label="Toggle replies">
                        <i className={`fa-solid fa-chevron-${showReplies ? 'up' : 'down'}`} />
                        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                )}
            </div>

            {showReplyForm && (
                <ReplyForm
                    parentId={comment.id}
                    onReplyAdded={handleReplyAdded}
                    onCancel={() => setShowReplyForm(false)}
                />
            )}

            {showReplies && replies.length > 0 && (
                <div className="fb-replies">
                    {replies.map(reply => (
                        <div key={reply.id} className="fb-reply-card">
                            <Avatar name={reply.fullName} image={reply.profileImage} size={34} />
                            <div className="fb-reply-content">
                                <div className="fb-reply-header">
                                    <span className="fb-reply-author">{reply.fullName}</span>
                                    {reply.membershipType === 'Premium' && (
                                        <span className="fb-premium-badge small"><i className="fa-solid fa-crown" /> Premium</span>
                                    )}
                                    <span className="fb-time">{timeAgo(reply.created_at)}</span>
                                </div>
                                <p className="fb-reply-message">{reply.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Feedback({ onAuthRequired }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // New comment form
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('General');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [charCount, setCharCount] = useState(0);

    const MAX_CHARS = 800;

    const loadComments = useCallback(async (cat, off, append) => {
        try {
            const params = { limit: PAGE_SIZE, offset: off };
            if (cat !== 'All') params.category = cat;
            const data = await api.feedback.getAll(params);
            if (append) setComments(prev => [...prev, ...data.comments]);
            else setComments(data.comments);
            setTotal(data.total);
            setHasMore(off + data.comments.length < data.total);
        } catch (err) {
            console.error('Feedback load error:', err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        setOffset(0);
        loadComments(activeCategory, 0, false).finally(() => setLoading(false));
    }, [activeCategory, loadComments]);

    const loadMore = async () => {
        const newOffset = offset + PAGE_SIZE;
        setLoadingMore(true);
        await loadComments(activeCategory, newOffset, true);
        setOffset(newOffset);
        setLoadingMore(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { onAuthRequired?.(); return; }
        if (message.trim().length < 3) { setFormError('Please write at least 3 characters.'); return; }
        setSubmitting(true); setFormError(''); setFormSuccess('');
        try {
            const newComment = await api.feedback.post({ message: message.trim(), category, rating: rating || undefined });
            setComments(prev => [newComment, ...prev]);
            setTotal(t => t + 1);
            setMessage(''); setCategory('General'); setRating(0); setCharCount(0);
            setFormSuccess('✅ Comment posted successfully!');
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (err) {
            setFormError(err.message || 'Failed to post comment.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = (id) => {
        setComments(prev => prev.filter(c => c.id !== id));
        setTotal(t => t - 1);
    };

    const handleLike = (id, newLikes) => {
        setComments(prev => prev.map(c => c.id === id ? { ...c, likes: newLikes } : c));
    };

    const handleMessageChange = (e) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) { setMessage(val); setCharCount(val.length); }
    };

    return (
        <section className="fb-section" id="feedback">
            <div className="fb-container">
                {/* ── Header ── */}
                <div className="fb-header">
                    <div className="fb-header-left">
                        <div className="fb-section-tag">
                            <i className="fa-solid fa-comments" /> Community Hub
                        </div>
                        <h2 className="fb-title">
                            Farmers'<br />
                            <span className="fb-title-accent">Voice Board</span>
                        </h2>
                        <p className="fb-subtitle">
                            Share insights, ask questions, and grow together with India's farming community.
                        </p>
                        <div className="fb-stats">
                            <div className="fb-stat">
                                <span className="fb-stat-num">{total}</span>
                                <span className="fb-stat-label">Comments</span>
                            </div>
                            <div className="fb-stat-divider" />
                            <div className="fb-stat">
                                <i className="fa-solid fa-users" style={{ color: '#4caf50', fontSize: '1.4rem' }} />
                                <span className="fb-stat-label">Community</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Post Form ── */}
                    <div className="fb-form-card">
                        <div className="fb-form-card-header">
                            <i className="fa-solid fa-pen-to-square" />
                            <span>{user ? `Post as ${user.fullName.split(' ')[0]}` : 'Share your thoughts'}</span>
                        </div>
                        {!user && (
                            <div className="fb-auth-prompt">
                                <i className="fa-solid fa-lock" />
                                <div>
                                    <p><strong>Sign in to participate</strong></p>
                                    <p>Join our community to post feedback, rate services, and reply to farmers.</p>
                                </div>
                                <button className="fb-login-btn" onClick={() => onAuthRequired?.()}>
                                    Login / Register
                                </button>
                            </div>
                        )}
                        <form className="fb-form" onSubmit={handleSubmit}>
                            <div className="fb-form-row">
                                <div className="fb-form-group">
                                    <label className="fb-label"><i className="fa-solid fa-tag" /> Category</label>
                                    <select
                                        className="fb-select"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        disabled={!user}
                                        id="fb-category-select"
                                    >
                                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="fb-form-group">
                                    <label className="fb-label"><i className="fa-solid fa-star" /> Rating (optional)</label>
                                    <StarRating value={rating} onChange={setRating} readonly={!user} />
                                </div>
                            </div>

                            <div className="fb-form-group fb-textarea-wrapper">
                                <label className="fb-label"><i className="fa-solid fa-message" /> Your Message</label>
                                <textarea
                                    className="fb-textarea"
                                    rows={4}
                                    placeholder={user ? "Share your experience, ask a question, or give a suggestion…" : "Login to post a comment…"}
                                    value={message}
                                    onChange={handleMessageChange}
                                    disabled={!user}
                                    id="fb-message-input"
                                />
                                <span className={`fb-char-count ${charCount > MAX_CHARS * 0.9 ? 'warn' : ''}`}>
                                    {charCount}/{MAX_CHARS}
                                </span>
                            </div>

                            {formError && <div className="fb-alert error"><i className="fa-solid fa-circle-xmark" /> {formError}</div>}
                            {formSuccess && <div className="fb-alert success"><i className="fa-solid fa-circle-check" /> {formSuccess}</div>}

                            <button
                                type="submit"
                                className="fb-submit-btn"
                                disabled={submitting || !user}
                                id="fb-submit-btn"
                            >
                                {submitting
                                    ? <><i className="fa-solid fa-spinner fa-spin" /> Posting…</>
                                    : <><i className="fa-solid fa-paper-plane" /> Post Comment</>
                                }
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Category Filter ── */}
                <div className="fb-filters" role="tablist" aria-label="Filter by category">
                    {CATEGORIES.map(cat => {
                        const meta = categoryMeta[cat];
                        return (
                            <button
                                key={cat}
                                role="tab"
                                aria-selected={activeCategory === cat}
                                className={`fb-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                style={activeCategory === cat ? { borderColor: meta.color, color: meta.color, background: meta.color + '15' } : {}}
                                onClick={() => setActiveCategory(cat)}
                                id={`fb-filter-${cat.toLowerCase().replace(' ','-')}`}
                            >
                                <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }} />
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* ── Comments List ── */}
                {loading ? (
                    <div className="fb-loading">
                        {[1,2,3].map(i => <div key={i} className="fb-skeleton" />)}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="fb-empty">
                        <i className="fa-solid fa-seedling fb-empty-icon" />
                        <h3>No comments yet</h3>
                        <p>Be the first to share your thoughts in the {activeCategory !== 'All' ? activeCategory : ''} community!</p>
                    </div>
                ) : (
                    <div className="fb-comments-grid">
                        {comments.map(comment => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                currentUser={user}
                                onDelete={handleDelete}
                                onLike={handleLike}
                                onAuthRequired={() => onAuthRequired?.()}
                                onReplyAdded={(parentId, reply) => {
                                    setComments(prev => prev.map(c =>
                                        c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
                                    ));
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── Load More ── */}
                {hasMore && (
                    <div className="fb-load-more-container">
                        <button className="fb-load-more-btn" onClick={loadMore} disabled={loadingMore} id="fb-load-more-btn">
                            {loadingMore
                                ? <><i className="fa-solid fa-spinner fa-spin" /> Loading…</>
                                : <><i className="fa-solid fa-chevron-down" /> Load More Comments</>
                            }
                        </button>
                        <p className="fb-count-text">Showing {comments.length} of {total} comments</p>
                    </div>
                )}
            </div>
        </section>
    );
}
