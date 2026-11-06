'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ value, onChange, accept, label = 'Upload image' }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (!f) {
      onChange(null);
      return;
    }
    onChange(URL.createObjectURL(f));
  };

  const isLocal = value?.startsWith('blob:') ?? false;
  const previewUrl = isLocal ? value : value;

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" /> {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
      />
      {(previewUrl || file) && (
        <div className="relative group">
          <img
            src={(file ? URL.createObjectURL(file) : previewUrl) as string}
            alt="Preview"
            className="h-48 w-48 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              onChange(null);
            }}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
