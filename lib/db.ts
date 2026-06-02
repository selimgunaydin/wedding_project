import { getSupabasePublicClient, getSupabaseServiceClient } from "@/lib/supabase";
import { seedEvents } from "@/lib/events";
import type { AdminStats, EventRecord, UploadFileType, UploadRecord, UploadStatus } from "@/types/database";

type UploadFilters = {
  eventSlug?: string;
  status?: UploadStatus;
  fileType?: UploadFileType;
  limit?: number;
};

export async function getEvents() {
  const client = getSupabasePublicClient();
  if (!client) return seedEvents;

  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("getEvents", error);
    return seedEvents;
  }

  return (data ?? []) as EventRecord[];
}

export async function getEventBySlug(slug: string) {
  const client = getSupabasePublicClient();
  if (!client) return seedEvents.find((event) => event.slug === slug) ?? null;

  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getEventBySlug", error);
    return seedEvents.find((event) => event.slug === slug) ?? null;
  }

  return (data as EventRecord | null) ?? null;
}

export async function getEventById(id: string) {
  const client = getSupabaseServiceClient() ?? getSupabasePublicClient();
  if (!client) return seedEvents.find((event) => event.id === id) ?? null;

  const { data, error } = await client.from("events").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getEventById", error);
    return seedEvents.find((event) => event.id === id) ?? null;
  }

  return (data as EventRecord | null) ?? null;
}

export async function createUploadRecord(input: {
  event: EventRecord;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileUrl: string;
  fileType: UploadFileType;
  mimeType: string;
  fileSize: number;
  uploadedByName?: string;
  uploadedByNote?: string;
}) {
  const client = getSupabaseServiceClient();
  if (!client) {
    throw new Error("Supabase service role yapılandırılmamış.");
  }

  const { data, error } = await client
    .from("uploads")
    .insert({
      event_id: input.event.id,
      event_slug: input.event.slug,
      file_name: input.fileName,
      original_file_name: input.originalFileName,
      file_path: input.filePath,
      file_url: input.fileUrl,
      file_type: input.fileType,
      mime_type: input.mimeType,
      file_size: input.fileSize,
      uploaded_by_name: input.uploadedByName ?? null,
      uploaded_by_note: input.uploadedByNote ?? null,
      status: "pending"
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as UploadRecord;
}

export async function getUploads(filters: UploadFilters = {}) {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  let query = client.from("uploads").select("*").order("created_at", { ascending: false });

  if (filters.eventSlug) query = query.eq("event_slug", filters.eventSlug);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.fileType) query = query.eq("file_type", filters.fileType);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getUploads", error);
    return [];
  }

  return (data ?? []) as UploadRecord[];
}

export async function updateUploadStatus(id: string, status: UploadStatus) {
  const client = getSupabaseServiceClient();
  if (!client) throw new Error("Supabase service role yapılandırılmamış.");

  const update =
    status === "approved"
      ? { status, approved_at: new Date().toISOString() }
      : { status, approved_at: null };

  const { data, error } = await client.from("uploads").update(update).eq("id", id).select("*").single();
  if (error) throw error;

  return data as UploadRecord;
}

export async function getUploadById(id: string) {
  const client = getSupabaseServiceClient();
  if (!client) return null;

  const { data, error } = await client.from("uploads").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getUploadById", error);
    return null;
  }

  return (data as UploadRecord | null) ?? null;
}

export async function deleteUploadRecord(id: string) {
  const client = getSupabaseServiceClient();
  if (!client) throw new Error("Supabase service role yapılandırılmamış.");

  const upload = await getUploadById(id);
  if (!upload) return null;

  const { error } = await client.from("uploads").delete().eq("id", id);
  if (error) throw error;

  return upload;
}

export async function bulkUpdateUploads(ids: string[], status: UploadStatus) {
  const client = getSupabaseServiceClient();
  if (!client) throw new Error("Supabase service role yapılandırılmamış.");

  const update =
    status === "approved"
      ? { status, approved_at: new Date().toISOString() }
      : { status, approved_at: null };

  const { data, error } = await client.from("uploads").update(update).in("id", ids).select("*");
  if (error) throw error;

  return (data ?? []) as UploadRecord[];
}

export async function bulkDeleteUploadRecords(ids: string[]) {
  const client = getSupabaseServiceClient();
  if (!client) throw new Error("Supabase service role yapılandırılmamış.");

  const { data: uploads, error: selectError } = await client.from("uploads").select("*").in("id", ids);
  if (selectError) throw selectError;

  const { error } = await client.from("uploads").delete().in("id", ids);
  if (error) throw error;

  return (uploads ?? []) as UploadRecord[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const events = await getEvents();
  const uploads = await getUploads();

  return {
    totalEvents: events.length,
    totalUploads: uploads.length,
    pendingUploads: uploads.filter((upload) => upload.status === "pending").length,
    approvedUploads: uploads.filter((upload) => upload.status === "approved").length,
    totalStorageBytes: uploads.reduce((sum, upload) => sum + upload.file_size, 0),
    imageCount: uploads.filter((upload) => upload.file_type === "image").length,
    videoCount: uploads.filter((upload) => upload.file_type === "video").length,
    byEvent: events.map((event) => {
      const eventUploads = uploads.filter((upload) => upload.event_slug === event.slug);

      return {
        event,
        total: eventUploads.length,
        pending: eventUploads.filter((upload) => upload.status === "pending").length,
        approved: eventUploads.filter((upload) => upload.status === "approved").length,
        storageBytes: eventUploads.reduce((sum, upload) => sum + upload.file_size, 0)
      };
    })
  };
}
