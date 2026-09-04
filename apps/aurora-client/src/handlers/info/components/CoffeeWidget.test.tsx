import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoffeeWidget, { coffeeState, COFFEE_STATES } from './CoffeeWidget';

describe('coffeeState', () => {
  it('maps every legacy code 0..10 to a state', () => {
    for (let i = 0; i <= 10; i += 1) {
      expect(coffeeState(i)).toBe(COFFEE_STATES[i]);
    }
  });

  it('falls back to Unknown for out-of-range codes', () => {
    expect(coffeeState(99)).toBe(COFFEE_STATES[10]);
    expect(coffeeState(-1)).toBe(COFFEE_STATES[10]);
  });
});

describe('CoffeeWidget', () => {
  it('shows the label for the given status', () => {
    render(<CoffeeWidget status={5} />);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('always renders (including the idle "It works" state)', () => {
    render(<CoffeeWidget status={0} />);
    expect(screen.getByText('It works')).toBeInTheDocument();
  });
});
