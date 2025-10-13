
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CommunityReportApi } from '@/apis/CommunityReportApi';

interface ReportPostModalProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  onReported?: () => void;
}

const reasons = [
  'Spam',
  'Inappropriate Content',
  'Harassment',
  'Other',
];

export default function ReportPostModal({ postId, open, onClose, onReported }: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReport = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    setError(null);
    try {
      await CommunityReportApi.reportPost(postId, selectedReason);
      setSelectedReason('');
      if (onReported) onReported();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to report post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-sm">Why are you reporting this post?</div>
          <div className="flex flex-col gap-2">
            {reasons.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  disabled={submitting}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleReport} disabled={!selectedReason || submitting}>
            {submitting ? 'Reporting...' : 'Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
