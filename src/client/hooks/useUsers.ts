import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
}

export function useUsers() {
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [activeUserToken, setActiveUserToken] = useState<string | null>(null);

  // Load active user ID, username and token from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('active_user_id');
    const savedName = localStorage.getItem('active_username');
    const savedToken = localStorage.getItem('active_user_token');
    if (savedId) {
      setActiveUserId(Number(savedId));
    }
    if (savedName) {
      setActiveUsername(savedName);
    }
    if (savedToken) {
      setActiveUserToken(savedToken);
    }
  }, []);

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
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('active_user_token');
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Token': token || '',
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ユーザーを削除できませんでした');
      }
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      // If deleted user was active, clear it
      if (activeUserId === deletedId) {
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
