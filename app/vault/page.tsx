"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ProtectedRoute } from "../../components/ProtectedRoute";

function VaultContent() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");

  async function onUpload() {
    if (!supabase) {
      setStatus("Supabase not configured. Provide env vars to enable uploads.");
      return;
    }
    if (!files.length) return;
    setStatus("Uploading…");
    try {
      // Requires a public bucket named 'vault' in Supabase Storage and appropriate policies
      const uploads = await Promise.all(
        files.map((f) => supabase.storage.from("vault").upload(`${Date.now()}-${f.name}`, f, { upsert: false }))
      );
      const ok = uploads.every((u) => !u.error);
      setStatus(ok ? "Uploaded!" : "Some uploads failed; check Supabase policies.");
    } catch (e) {
      setStatus("Upload failed.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="section-title">Vault</h1>
      <p className="text-slate-600 text-sm dark:text-slate-300">Store boarding passes, photos, and docs. Configure Supabase Storage to enable uploads.</p>
      <div className="glass-card p-6 space-y-4">
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <div className="flex items-center gap-3">
          <button className="btn-primary text-sm" onClick={onUpload}>
            Upload
          </button>
          {status && <div className="text-sm text-slate-700">{status}</div>}
        </div>
        {!!files.length && (
          <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
            {files.map((f) => (
              <li key={f.name}>{f.name} • {(f.size / 1024).toFixed(1)} KB</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function VaultPage() {
  return (
    <ProtectedRoute>
      <VaultContent />
    </ProtectedRoute>
  );
}