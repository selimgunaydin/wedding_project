export type EventType = "engagement" | "wedding_1" | "wedding_2";
export type UploadStatus = "pending" | "approved" | "rejected";
export type UploadFileType = "image" | "video";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  event_type: EventType;
  event_date: string;
  description: string;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UploadRecord = {
  id: string;
  event_id: string;
  event_slug: string;
  file_name: string;
  original_file_name: string;
  file_path: string;
  file_url: string;
  file_type: UploadFileType;
  mime_type: string;
  file_size: number;
  status: UploadStatus;
  uploaded_by_name: string | null;
  uploaded_by_note: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
};

export type AdminStats = {
  totalEvents: number;
  totalUploads: number;
  pendingUploads: number;
  approvedUploads: number;
  totalStorageBytes: number;
  imageCount: number;
  videoCount: number;
  byEvent: Array<{
    event: EventRecord;
    total: number;
    pending: number;
    approved: number;
    storageBytes: number;
  }>;
};
