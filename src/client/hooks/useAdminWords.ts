import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Word, WordInput, DictionaryWord } from '@shared/types';

export interface AdminCredentials {
  readonly username: string;
  readonly password: string;
}

function makeAuthHeader(creds: AdminCredentials): string {
  return `Basic ${btoa(`${creds.username}:${creds.password}`)}`;
}

async function adminFetch<T>(
  path: string,
  init: RequestInit,
  creds: AdminCredentials
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
      Authorization: makeAuthHeader(creds),
    },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { readonly message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useAdminWords(creds: AdminCredentials | null) {
  return useQuery<readonly Word[], Error>({
    queryKey: ['admin', 'words', creds?.username],
    queryFn: () => {
      if (!creds) throw new Error('UNAUTHORIZED');
      return adminFetch<readonly Word[]>('/api/admin/words', {}, creds);
    },
    enabled: creds !== null,
    retry: false,
  });
}

export function useCreateWord(creds: AdminCredentials) {
  const qc = useQueryClient();
  return useMutation<Word, Error, WordInput>({
    mutationFn: (input) =>
      adminFetch<Word>(
        '/api/admin/words',
        { method: 'POST', body: JSON.stringify(input) },
        creds
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
  });
}

export function useUpdateWord(creds: AdminCredentials) {
  const qc = useQueryClient();
  return useMutation<Word, Error, { readonly id: number; readonly input: Partial<WordInput> }>({
    mutationFn: ({ id, input }) =>
      adminFetch<Word>(
        `/api/admin/words/${id}`,
        { method: 'PUT', body: JSON.stringify(input) },
        creds
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
  });
}

export function useDeleteWord(creds: AdminCredentials) {
  const qc = useQueryClient();
  return useMutation<{ readonly ok: true }, Error, number>({
    mutationFn: (id) =>
      adminFetch<{ readonly ok: true }>(
        `/api/admin/words/${id}`,
        { method: 'DELETE' },
        creds
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
  });
}

export function useSearchDictionary(query: string, creds: AdminCredentials | null) {
  return useQuery<readonly string[], Error>({
    queryKey: ['admin', 'dictionary', 'search', query, creds?.username],
    queryFn: () => {
      if (!creds) throw new Error('UNAUTHORIZED');
      return adminFetch<readonly string[]>(
        `/api/admin/dictionary/search?q=${encodeURIComponent(query)}`,
        {},
        creds
      );
    },
    enabled: creds !== null && query.trim().length > 0,
    staleTime: 60000,
  });
}

export function useLookupDictionary(creds: AdminCredentials) {
  return useMutation<DictionaryWord | null, Error, string>({
    mutationFn: (english) =>
      adminFetch<DictionaryWord | null>(
        `/api/admin/dictionary/lookup?english=${encodeURIComponent(english)}`,
        {},
        creds
      ),
  });
}

