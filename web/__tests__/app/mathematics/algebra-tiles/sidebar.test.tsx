import { render, screen } from '@testing-library/react';
import { TileSidebar } from '@/app/mathematics/algebra-tiles/_components/sidebar';

describe('TileSidebar', () => {
  it('renders accessible buttons for all tiles', () => {
    render(<TileSidebar onAddTile={jest.fn()} showY={true} />);

    // Check for DraggableTileButton (e.g. "x²")
    // These have text content so they should be accessible by name
    expect(screen.getByRole('button', { name: /\+x²/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+y²/i })).toBeInTheDocument();

    // Check for TileRow buttons (e.g. vertical/horizontal x)
    // Now these should be accessible via aria-label
    expect(screen.getByRole('button', { name: /add vertical \+x tile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add horizontal \+x tile/i })).toBeInTheDocument();

    // Check y and xy as well
    expect(screen.getByRole('button', { name: /add vertical \+y tile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add horizontal \+y tile/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /add vertical \+xy tile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add horizontal \+xy tile/i })).toBeInTheDocument();
  });
});
