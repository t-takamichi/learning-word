import React from 'react';
import { UserSelectTemplate } from '../components/templates/UserSelectTemplate';
import { UserSelector } from '../components/organisms/UserSelector';
import { useUsers } from '../hooks/useUsers';
import { useSound } from '../hooks/useSound';
import { navigateTo } from '../lib/navigation';

export function UserSelectPage(): React.ReactElement {
  const { activeUser, registerAsync, loginAsync, deleteUserAsync, clearActiveUser } = useUsers();
  const sound = useSound();

  const handleLogin = async (username: string, pin: string): Promise<void> => {
    sound.unlock();
    await loginAsync({ username, pin });
    sound.play('combo');
    navigateTo('/levels');
  };

  const handleRegister = async (username: string, pin: string): Promise<void> => {
    sound.unlock();
    await registerAsync({ username, pin });
    sound.play('combo');
    navigateTo('/levels');
  };

  const handleLogout = (): void => {
    sound.unlock();
    clearActiveUser();
  };

  const handleDelete = async (id: number): Promise<void> => {
    sound.unlock();
    await deleteUserAsync(id);
    sound.play('again');
  };

  return (
    <UserSelectTemplate>
      <UserSelector 
        activeUser={activeUser}
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onLogout={handleLogout}
        onDelete={handleDelete}
      />
    </UserSelectTemplate>
  );
}
