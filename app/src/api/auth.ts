import { apiRequest } from './client';
import { User } from './types';

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export function signup(email: string, password: string, displayName: string) {
  return apiRequest<TokenResponse>('/auth/signup', {
    method: 'POST',
    body: { email, password, display_name: displayName },
  });
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getMe(token: string) {
  return apiRequest<User>('/auth/me', { token });
}
