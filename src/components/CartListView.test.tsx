import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartListView from './CartListView';

describe('CartListView Component', () => {
  it('renders correctly without crashing', () => {
    render(<CartListView items={[]} onUpdateQuantity={() => {}} />);
    expect(screen.getByRole('container')).toBeInferred();
  });

  it('renders empty cart state when no items are provided', () => {
    render(<CartListView items={[]} />);
    expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
  });

  it('renders cart items grouped by store categories', () => {
    const mockItems = [
      {
        id: 'item-1',
        item: 'Organic Avocados',
        category: 'Produce' as const,
        est_price: 3.99,
        aisle: 'Aisle 1 (Produce)',
        aisleNumber: 1,
        checked: false,
        quantity: 2,
        isOrganic: true,
      },
    ];

    render(<CartListView items={mockItems} />);
    expect(screen.getByText('Organic Avocados')).toBeInTheDocument();
    expect(screen.getByText('Produce')).toBeInTheDocument();
  });
});
