import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {
    it('should render app successfully', () => {
        render(<App />);

        expect(screen.getByText('Cyclops')).toBeInTheDocument();
    });
});
