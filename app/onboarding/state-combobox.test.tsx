import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StateCombobox } from './state-combobox';
import type { UsState } from '@/types/us-states';

const STATES: UsState[] = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
];

describe('StateCombobox', () => {
  it('filters options as user types and writes selected code to hidden input', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <form>
        <label htmlFor="state">State</label>
        <StateCombobox name="state" inputId="state" states={STATES} />
      </form>
    );

    const input = screen.getByLabelText('State');
    await user.click(input);
    await user.type(input, 'cal');

    expect(screen.getByRole('button', { name: /California \(CA\)/ })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /New York \(NY\)/ })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /California \(CA\)/ }));

    const hidden = container.querySelector('input[name="state"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe('CA');
    expect((input as HTMLInputElement).value).toBe('California');
  });

  it('clears selection if user edits the input after selecting', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <form>
        <label htmlFor="state">State</label>
        <StateCombobox name="state" inputId="state" states={STATES} />
      </form>
    );

    const input = screen.getByLabelText('State');
    await user.click(input);
    await user.type(input, 'cal');
    await user.click(screen.getByRole('button', { name: /California \(CA\)/ }));

    const hidden = container.querySelector('input[name="state"]') as HTMLInputElement;
    expect(hidden.value).toBe('CA');

    await user.type(input, 'x');
    expect(hidden.value).toBe('');
  });
});

