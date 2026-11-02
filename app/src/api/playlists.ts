import { apiRequest } from './client';
import { FeedbackType, Mood, PlaylistDetail, PlaylistSummary } from './types';

export function listMoods(token: string) {
  return apiRequest<Mood[]>('/moods', { token });
}

export function generatePlaylist(
  token: string,
  params: { moodPromptText?: string; moodSlug?: string },
) {
  return apiRequest<PlaylistDetail>('/playlists/generate', {
    method: 'POST',
    token,
    body: { mood_prompt_text: params.moodPromptText, mood_slug: params.moodSlug },
  });
}

export function listPlaylists(token: string) {
  return apiRequest<PlaylistSummary[]>('/playlists', { token });
}

export function getPlaylist(token: string, playlistId: string) {
  return apiRequest<PlaylistDetail>(`/playlists/${playlistId}`, { token });
}

export function submitTrackFeedback(
  token: string,
  trackId: string,
  params: { playlistId?: string; feedbackType: FeedbackType; playbackPositionSec?: number },
) {
  return apiRequest<void>(`/tracks/${trackId}/feedback`, {
    method: 'POST',
    token,
    body: {
      playlist_id: params.playlistId,
      feedback_type: params.feedbackType,
      playback_position_sec: params.playbackPositionSec,
    },
  });
}
