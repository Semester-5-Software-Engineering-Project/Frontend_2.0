// StudentCommunity/CreatePostForm.tsx
'use client';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CommunityPostApi } from '@/apis/CommunityPostApi';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    let imageUrls: string[] = [];
    try {
      if (images.length > 0) {
        setUploadingImages(true);
        for (const img of images) {
          const url = await CommunityPostApi.uploadImage(img);
          imageUrls.push(url);
        }
        setUploadingImages(false);
      }
      await CommunityPostApi.createPost({ title, description, imageUrls });
      setTitle('');
      setDescription('');
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setUploadingImages(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 mb-8 border border-gray-100 max-w-2xl mx-auto flex flex-col gap-4">
      <h2 className="font-bold text-lg mb-2">Create a Post</h2>
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={100}
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        maxLength={1000}
        rows={3}
      />
      <Input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(img)}
              alt="preview"
              className="rounded-lg max-h-32 border object-cover"
              style={{ maxWidth: 100 }}
            />
          ))}
        </div>
      )}
      {uploadingImages && (
        <div className="text-blue-500 text-sm">Uploading images...</div>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Posting...' : 'Post'}
      </Button>
    </form>
  );
}
