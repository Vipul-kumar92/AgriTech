import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (k, fallback) => fallback || k,
    isHindi: false,
    language: 'en',
    toggleLanguage: vi.fn(),
  }),
}));

describe('Navbar routing and profile pill', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('routes brand logo to / and displays Crop Doctor and Sign In when logged out', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar onToggleSidebar={vi.fn()} />
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link', { name: /Krishi\s*Pulse/i });
    expect(logoLink).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Crop Doctor/i })).toHaveAttribute('href', '/crop-doctor');
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
  });

  it('routes brand logo to /dashboard and shows profile badge pill when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Vipul Kumar', role: 'FARMER' },
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Navbar onToggleSidebar={vi.fn()} />
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link', { name: /Krishi\s*Pulse/i });
    expect(logoLink).toHaveAttribute('href', '/dashboard');

    const profileLink = screen.getByRole('link', { name: /View Profile/i });
    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(profileLink).toHaveTextContent('Vipul Kumar');
    expect(profileLink).toHaveTextContent('FARMER');
  });
});
