import React from 'react';
import { render, screen } from '@testing-library/react';
import ExchangesPage from '../../pages/exchanges';

// Mock the ExchangeManager component
jest.mock('../../components/exchanges/ExchangeManager', () => ({
    ExchangeManager: () => <div data-testid="exchange-manager">Exchange Manager</div>
}));

describe('ExchangesPage', () => {
    it('renders page title and description', () => {
        render(<ExchangesPage />);

        expect(screen.getByText('Exchange Management')).toBeInTheDocument();
        expect(screen.getByText(/Configure and manage your exchange connections/)).toBeInTheDocument();
    });

    it('renders ExchangeManager component', () => {
        render(<ExchangesPage />);

        expect(screen.getByTestId('exchange-manager')).toBeInTheDocument();
    });

    it('renders page in a container with proper spacing', () => {
        const { container } = render(<ExchangesPage />);

        // Check for Container component
        expect(container.firstChild).toHaveClass('MuiContainer-root');

        // Check for Box component with padding
        const box = container.querySelector('.MuiBox-root');
        expect(box).toHaveStyle({ paddingTop: '32px', paddingBottom: '32px' });

        // Check for Paper component with padding
        const paper = container.querySelector('.MuiPaper-root');
        expect(paper).toHaveStyle({ padding: '24px' });
    });
}); 