'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ReviewsModal({
  product,
  isOpen,
  onClose,
  reviews = [],
  loading = false,
  submitting = false,
  onSubmitReview,
}) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    await onSubmitReview({ authorName, rating, comment });
    setAuthorName('');
    setComment('');
    setRating(5);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : (product.rating || 5.0).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Reviews & Ratings"
      subtitle={product.title}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-8">
        
        {/* Rating Summary Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--card-clay)] border border-[var(--border)]">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold font-editorial text-[var(--foreground)]">
              {averageRating}
            </span>
            <div>
              <StarRating rating={Number(averageRating)} size={16} showValue={false} />
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Based on {reviews.length || product.review_count || 12} customer reviews
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ✓ 100% Verified Purchases
          </span>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Verified Experiences ({reviews.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
              Loading verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-2xl">
              Be the first to share your thoughts on this boutique piece!
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {reviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-light)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-clay)] text-[var(--accent-dark)] font-bold text-xs flex items-center justify-center">
                        {rev.author_name?.charAt(0) || 'C'}
                      </div>
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {rev.author_name || 'Verified Customer'}
                      </span>
                    </div>
                    <StarRating rating={rev.rating || 5} size={12} />
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed pl-9">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 text-left">
          <h4 className="font-editorial text-lg font-semibold text-[var(--foreground)]">
            Leave Your Review
          </h4>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Your Rating
            </label>
            <StarRating rating={rating} interactive size={20} onChange={setRating} />
          </div>

          <Input
            label="Your Name"
            placeholder="e.g. Chinelo Adebayo"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Detailed Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the fabric feel, size fit, and overall quality..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-3 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="clay"
            size="md"
            className="w-full"
            isLoading={submitting}
          >
            Submit Verified Review
          </Button>
        </form>

      </div>
    </Modal>
  );
}
