"use client";
import { useEffect, useState } from "react";
import { getJSON, setJSON } from "../lib/localStore";

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export function CommentsPanel({ tripId }: { tripId: string }) {
  const storageKey = `trip:${tripId}:comments`;
  const [comments, setComments] = useState<Comment[]>(() => getJSON(storageKey, []));
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    setJSON(storageKey, comments);
  }, [comments, storageKey]);

  function addComment() {
    if (!text.trim()) return;
    const c: Comment = {
      id: uid(),
      author: author.trim() || "You",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments([c, ...comments]);
    setText("");
  }

  function deleteComment(id: string) {
    setComments(comments.filter(c => c.id !== id));
  }

  function editComment(id: string, newText: string) {
    setComments(comments.map(c => (c.id === id ? { ...c, text: newText } : c)));
  }

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="card-title flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
          Comments
        </div>
        <span className="text-xs text-slate-400">{comments.length} comments</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea className="input" rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="Share an update or idea..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input className="input flex-1" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name (optional)" />
          <button className="btn-primary" onClick={addComment}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Post
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <div className="text-sm">No comments yet. Be the first!</div>
          </div>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id} comment={c} onDelete={() => deleteComment(c.id)} onEdit={(t) => editComment(c.id, t)} />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onDelete, onEdit }: { comment: Comment; onDelete: () => void; onEdit: (text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment.text);
  
  const initials = (comment.author || 'A').charAt(0).toUpperCase();
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
  const colorIndex = (comment.author || '').length % colors.length;
  
  return (
    <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-full ${colors[colorIndex]} flex items-center justify-center text-sm font-semibold text-white flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-900 dark:text-slate-100">{comment.author || "Anonymous"}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {!editing ? (
            <p className="mt-1 text-slate-700 dark:text-slate-300">{comment.text}</p>
          ) : (
            <textarea className="input mt-2" rows={2} value={value} onChange={e => setValue(e.target.value)} />
          )}
          <div className="flex gap-2 mt-2">
            {!editing ? (
              <>
                <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => setEditing(true)}>Edit</button>
                <button className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={onDelete}>Delete</button>
              </>
            ) : (
              <>
                <button className="btn-primary text-xs px-3 py-1" onClick={() => { onEdit(value); setEditing(false); }}>Save</button>
                <button className="btn-secondary text-xs px-3 py-1" onClick={() => { setValue(comment.text); setEditing(false); }}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
