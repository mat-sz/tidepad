interface UserOrderItemCategory {
  category: string;
  name: string;
  spaces: number[];
}

interface UserOrderItemSpace {
  space: number;
}

export type UserOrder = (UserOrderItemCategory | UserOrderItemSpace)[];

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

export interface NoteAttachment {
  url: string;
  size: number;
  type: string;
  image?: {
    width: number;
    height: number;
  };
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}
