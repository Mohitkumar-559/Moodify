export type User = {
  id: string;
  email: string;
  display_name: string;
};

export type Mood = {
  id: string;
  slug: string;
  name: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration_sec: number;
  preview_url: string | null;
  cover_url: string | null;
  is_downloadable: boolean;
};

export type PlaylistTrack = {
  position: number;
  track: Track;
};

export type PlaylistSummary = {
  id: string;
  title: string;
  mood_prompt_text: string | null;
  primary_mood: Mood | null;
  cover_accent_color: string | null;
  track_count: number;
  created_at: string;
};

export type PlaylistDetail = {
  id: string;
  title: string;
  mood_prompt_text: string | null;
  primary_mood: Mood | null;
  cover_accent_color: string | null;
  created_at: string;
  tracks: PlaylistTrack[];
};

export type FeedbackType = 'like' | 'dislike' | 'skip' | 'completed';
