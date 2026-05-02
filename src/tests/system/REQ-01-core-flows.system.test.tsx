import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';
import api from '../../api/axios';

function setCitizenUser() {
  localStorage.setItem('accessToken', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'u1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'citizen@example.com',
    roles: ['CITIZEN'],
  }));
}

function setAdminUser() {
  localStorage.setItem('accessToken', 'test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 'a1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@municipality.gov',
    roles: ['ADMIN'],
  }));
}

describe('System testing - core navigation flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('[System testing][REQ-SYS-01] citizen can open Announcements page and see published items', async () => {
    setCitizenUser();
    vi.spyOn(api, 'get').mockImplementation(async (url: any) => {
      if (url === '/common/announcements') {
        return { data: [{ id: 1, title: 'Holiday Closure', content: 'Closed May 5th', priority: 'high', publishedAt: new Date().toISOString() }] } as any;
      }
      if (url === '/citizen/notifications') return { data: [] } as any;
      return { data: [] } as any;
    });

    window.history.pushState({}, '', '/announcements');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Announcements' })).toBeInTheDocument();
    });
    expect(screen.getByText('Holiday Closure')).toBeInTheDocument();
    expect(screen.getByText(/Closed May 5th/i)).toBeInTheDocument();
  });

  it('[System testing][REQ-SYS-02] admin can open User Management page', async () => {
    setAdminUser();
    vi.spyOn(api, 'get').mockImplementation(async (url: any) => {
      if (url === '/admin/users') {
        return { data: [{ id: 'u1', firstName: 'John', lastName: 'Doe', email: 'citizen@example.com', roles: [{ name: 'CITIZEN' }] }] } as any;
      }
      return { data: [] } as any;
    });

    window.history.pushState({}, '', '/admin/users');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'User Management' })).toBeInTheDocument();
    });
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});

