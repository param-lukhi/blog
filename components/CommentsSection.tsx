'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface CommentItem {
  id: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string | Date;
  status?: string;
}

interface CommentsSectionProps {
  blogId?: string;
  initialComments?: CommentItem[];
}

function getCommentTime(dateInput: string | Date) {
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(date);
  } catch {
    return 'Recently';
  }
}

export default function CommentsSection({ blogId, initialComments = [] }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [isLoading, setIsLoading] = useState(!initialComments.length && !!blogId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Fetch real comments for this specific blog if blogId is provided
  useEffect(() => {
    if (!blogId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/comments?blogId=${blogId}&status=APPROVED`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setComments(data);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanText = commentText.trim();
    if (!cleanName || !cleanText || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: cleanName,
          email: email.trim() || undefined,
          content: cleanText,
          blogId: blogId || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment: CommentItem = await res.json();

      // Deduplicate: ensure this comment ID isn't already in list
      setComments((prev) => {
        const filtered = prev.filter((c) => c.id !== newComment.id);
        return [newComment, ...filtered];
      });

      setCommentText('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setError('Could not submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strictly deduplicate by id
  const uniqueComments = Array.from(new Map(comments.map((c) => [c.id, c])).values());

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm my-10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Community Comments ({uniqueComments.length})
          </h3>
        </div>
        {uniqueComments.length > 0 && (
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {uniqueComments.length} {uniqueComments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
              Email Address <span className="text-neutral-400 font-normal">(optional - never published)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
            Your Comment or Question <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Share your opinion, feedback, or ask a question about this product..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        {submitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Thank you! Your comment has been posted successfully.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <span>Post Comment</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        {isLoading ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="text-xs">Loading comments...</span>
          </div>
        ) : uniqueComments.length === 0 ? (
          <div className="py-10 text-center rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800/60 p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              No comments yet
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Be the first to share your thoughts, ask questions, or provide feedback on this review!
            </p>
          </div>
        ) : (
          uniqueComments.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-extrabold flex items-center justify-center text-xs uppercase shadow-sm">
                    {c.author ? c.author.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      {c.author}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {getCommentTime(c.createdAt)}
                </span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-10 whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
