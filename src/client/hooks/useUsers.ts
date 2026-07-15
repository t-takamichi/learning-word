import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authedFetch } from '../lib/authedFetch';

interface User {
  id: number;
  username: string;
}

// Read synchronously so the value is correct on the very first render. Hydrating
// via useEffect leaves a window where these are null, which makes route guards
// (e.g. WordSetSelectPage) redirect to /users before the real user is restored.
const readStored = (key: string): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem(key);

export function useUsers() {
  const [activeUserId, setActiveUserId] = useState<number | null>(() => {
    const saved = readStored('active_user_id');
    return saved ? Number(saved) : null;
  });
  const [activeUsername, setActiveUsername] = useState<string | null>(() => readStored('active_username'));
  const [activeUserToken, setActiveUserToken] = useState<string | null>(() => readStored('active_user_token'));

  const selectUser = (user: { id: number; username: string; token: string }): void => {
    setActiveUserId(user.id);
    setActiveUsername(user.username);
    setActiveUserToken(user.token);
    localStorage.setItem('active_user_id', String(user.id));
    localStorage.setItem('active_username', user.username);
    localStorage.setItem('active_user_token', user.token);
    localStorage.removeItem('active_word_set_id'); // Reset selected level for the user change
  };

  const clearActiveUser = (): void => {
    setActiveUserId(null);
    setActiveUsername(null);
    setActiveUserToken(null);
    localStorage.removeItem('active_user_id');
    localStorage.removeItem('active_username');
    localStorage.removeItem('active_user_token');
    localStorage.removeItem('active_word_set_id');
  };

  // Mutations
  const registerMutation = useMutation({
    mutationFn: async ({ username, pin }: { username: string; pin: string }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ユーザーを登録できませんでした');
      }
      return res.json() as Promise<{ id: number; username: string; token: string }>;
    },
    onSuccess: (newUser) => {
      selectUser(newUser);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, pin }: { username: string; pin: string }) => {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ログインに失敗しました。ユーザー名またはPINを確認してください。');
      }
      return res.json() as Promise<{ id: number; username: string; token: string }>;
    },
    onSuccess: (user) => {
      selectUser(user);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, pin }: { id: number; pin: string }) => {
      const res = await authedFetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ユーザーを削除できませんでした');
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      // If deleted user was active, clear it
      if (activeUserId === id) {
        clearActiveUser();
      }
    },
  });

  const activeUser = activeUserId && activeUsername ? { id: activeUserId, username: activeUsername } : null;

  return {
    activeUser,
    activeUserId,
    isLoading: registerMutation.isPending || loginMutation.isPending || deleteMutation.isPending,
    error: registerMutation.error || loginMutation.error || deleteMutation.error,
    clearActiveUser,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    deleteUser: deleteMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    loginAsync: loginMutation.mutateAsync,
    deleteUserAsync: deleteMutation.mutateAsync,
  };
}
