"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function VaultPage() {
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vault</h1>
      <p className="text-gray-600 text-sm">Store boarding passes, photos, and docs. Configure Supabase Storage to enable uploads.</p>
      <div className="rounded border p-4 space-y-3">
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button className="rounded border px-3 py-2 text-sm" onClick={onUpload}>
          Upload
        </button>
        {status && <div className="text-sm text-gray-700">{status}</div>}
        {!!files.length && (
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {files.map((f) => (
              <li key={f.name}>{f.name} • {(f.size / 1024).toFixed(1)} KB</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
