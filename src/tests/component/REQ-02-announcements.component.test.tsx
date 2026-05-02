import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Announcements from '../../pages/citizen/Announcements';
import api from '../../api/axios';

describe('Component testing - Announcements page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[Component testing][REQ-CMP-ANN-01] renders all announcements returned by backend', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: [
        { id: 1, title: 'A1', content: 'C1', priority: 'low', publishedAt: new Date().toISOString() },
        { id: 2, title: 'A2', content: 'C2', priority: 'high', publishedAt: new Date().toISOString() },
      ],
    } as any);

    render(
      <MemoryRouter>
        <Announcements />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('A1')).toBeInTheDocument());
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });
});

