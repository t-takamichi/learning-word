import React from 'react';
import { UserSelectTemplate } from '../components/templates/UserSelectTemplate';
import { UserSelector } from '../components/organisms/UserSelector';
import { useUsers } from '../hooks/useUsers';
import { useSound } from '../hooks/useSound';
import { navigateTo } from '../lib/navigation';

export function UserSelectPage(): React.ReactElement {
  const { users, activeUserId, selectUser, deleteUser, createUser } = useUsers();
  const sound = useSound();

  const handleSelect = (id: number): void => {
    sound.unlock(); // Ensure AudioContext is unlocked on user gesture
    selectUser(id);
    
    // Play delightful welcome sound
    sound.play('combo');
    
    // Navigate to level select page
    navigateTo('/levels');
  };

  const handleDelete = (id: number): void => {
    sound.unlock();
    deleteUser(id);
    sound.play('again');
  };

  const handleCreate = (username: string): void => {
    sound.unlock();
    createUser(username, {
      onSuccess: () => {
        sound.play('combo');
        navigateTo('/levels');
      }
    });
  };

  return (
    <UserSelectTemplate>
      <UserSelector 
        users={users} 
        activeUserId={activeUserId} 
        onSelect={handleSelect} 
        onDelete={handleDelete} 
        onCreate={handleCreate} 
      />
    </UserSelectTemplate>
  );
}
