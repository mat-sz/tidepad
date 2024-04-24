export interface SpaceType {
  id: number;
  name: string;
}

export interface NoteAttachmentType {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  size: number;
  contentType: string;
  height?: number;
  width?: number;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
  thumbnailUrl?: string;
  thumbnailFilename?: string;
}

export interface NotesResponse {
  firstId?: number;
  lastId?: number;
  notes: NoteType[];
}

export interface NoteType {
  id: number;
  body: string;
  authorId: number;
  createdAt: string;
  pinned: boolean;
  clientSideType?: 'sending' | 'updating' | 'error';
  attachments?: NoteAttachmentType[] | File[];
  canEdit?: boolean;
  canDelete?: boolean;
}

interface NoteEmbedThumbnail {
  url: string;
  height?: number;
  width?: number;
}

// TODO: Clean those up.
interface NoteEmbedVideo {
  url: string;
  height?: number;
  width?: number;
}

interface NoteEmbedImage {
  url: string;
  height?: number;
  width?: number;
}

interface NoteEmbedAudio {
  url: string;
}

interface NoteEmbedProvider {
  name?: string;
  url?: string;
}

interface NoteEmbedAuthor {
  text: string;
  url?: string;
  icon_url?: string;
}

interface NoteEmbedFooter {
  text: string;
  icon_url?: string;
}

interface NoteEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface NoteEmbed {
  title?: string;
  type?: 'rich' | 'image' | 'video' | 'article' | 'link';
  description?: string;
  url?: string;
  timestamp?: number;
  color?: string; // TODO: Think of a better way to store colors.
  footer?: NoteEmbedFooter;
  image?: NoteEmbedImage;
  thumbnail?: NoteEmbedThumbnail;
  video?: NoteEmbedVideo;
  audio?: NoteEmbedAudio;
  provider?: NoteEmbedProvider;
  author?: NoteEmbedAuthor;
  fields?: NoteEmbedField;
}
