import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Polls from '../../pages/citizen/Polls';
import api from '../../api/axios';

describe('Component testing - Polls page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[Component testing][REQ-CMP-POL-01] shows active polls and allows voting', async () => {
    const getSpy = vi.spyOn(api, 'get');
    getSpy.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          question: 'New Park Location?',
          description: 'Choose one',
          options: [
            { id: 101, optionText: 'Downtown' },
            { id: 102, optionText: 'East Suburb' },
          ],
        },
      ],
    } as any);

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { ok: true } } as any);
    // reload after voting
    getSpy.mockResolvedValueOnce({ data: [] } as any);

    render(
      <MemoryRouter>
        <Polls />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('New Park Location?')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Downtown'));

    expect(postSpy).toHaveBeenCalledWith('/citizen/polls/10/vote', { optionId: 101 });
  });
});

