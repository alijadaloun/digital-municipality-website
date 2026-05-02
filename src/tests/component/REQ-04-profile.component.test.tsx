import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../../pages/common/Profile';
import api from '../../api/axios';
import { AuthProvider } from '../../context/AuthContext';

describe('Component testing - Profile page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 't');
    localStorage.setItem('user', JSON.stringify({
      id: 'u1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'citizen@example.com',
      phone: '',
      roles: ['CITIZEN'],
    }));
  });

  it('[Component testing][REQ-CMP-PRO-01] allows updating name and phone', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'citizen@example.com', phone: '' },
    } as any);

    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValueOnce({
      data: { id: 'u1', firstName: 'Jane', lastName: 'Doe', email: 'citizen@example.com', phone: '+961' },
    } as any);

    render(
      <AuthProvider>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('My Profile')).toBeInTheDocument());

    // Inputs don't currently link <label> -> <input>, so we query by existing values / placeholder.
    const firstNameInput = screen.getByDisplayValue('John') as HTMLInputElement;
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');

    const phoneInput = screen.getByPlaceholderText('+961 ...') as HTMLInputElement;
    await userEvent.type(phoneInput, '+961');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(patchSpy).toHaveBeenCalledWith('/citizen/profile', expect.objectContaining({ firstName: 'Jane' }));
  });
});

