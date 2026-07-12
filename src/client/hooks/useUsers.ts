import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';
import { useState, useEffect } from 'react';
import type { AppType } from '../../server/index';

const client = hc<AppType>('/');

interface User {
  id: number;
  username: string;
}

export function useUsers() {
  const queryClient = useQueryClient();
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  // Load active user ID from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('active_user_id');
    if (saved) {
      setActiveUserId(Number(saved));
    }
  }, []);

  const selectUser = (id: number): void => {
    setActiveUserId(id);
    localStorage.setItem('active_user_id', String(id));
    localStorage.removeItem('active_word_set_id'); // Reset selected level for the user change
  };

  const clearActiveUser = (): void => {
    setActiveUserId(null);
    localStorage.removeItem('active_user_id');
  };

  // Queries
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await client.api.users.$get();
      if (!res.ok) throw new Error('ユーザー情報の取得に失敗しました');
      return res.json() as Promise<User[]>;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await client.api.users.$post({ json: { username } });
      if (!res.ok) throw new Error('ユーザーを登録できませんでした');
      return res.json() as Promise<User>;
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Automatically select the newly created user
      selectUser(newUser.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await client.api.users[':id'].$delete({ param: { id: String(id) } });
      if (!res.ok) throw new Error('ユーザーを削除できませんでした');
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // If deleted user was active, clear it
      if (activeUserId === deletedId) {
        clearActiveUser();
      }
    },
  });

  const activeUser = users.find(u => u.id === activeUserId) ?? null;

  return {
    users,
    activeUser,
    activeUserId,
    isLoading,
    error: error instanceof Error ? error : null,
    selectUser,
    clearActiveUser,
    createUser: createMutation.mutate,
    deleteUser: deleteMutation.mutate,
  };
}
