import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    render(<App />);
    const title = screen.queryByText(/invernadero/i);
    expect(title).toBeInTheDocument();
  });

  it('should have proper structure', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
