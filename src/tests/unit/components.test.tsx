import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock component for testing
const SimpleButton = ({ label }: { label: string }) => (
  <button className="bg-blue-500 text-white p-2 rounded">{label}</button>
);

describe('Unit testing - small isolated components', () => {
  it('[Unit testing][REQ-UNIT-UI-01] should render button with correct label', () => {
    render(<SimpleButton label="Submit Request" />);
    const btn = screen.getByText('Submit Request');
    expect(btn).toBeDefined();
    expect(btn.classList.contains('bg-blue-500')).toBe(true);
  });
});
