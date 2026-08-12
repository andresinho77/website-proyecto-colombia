import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HeroButtons } from '../../components/HeroButtons';

describe('HeroButtons', () => {
  it('calls the feed handler when the need-help CTA is clicked', () => {
    const onOpenFeed = vi.fn();
    const onOpenPublish = vi.fn();

    render(<HeroButtons onOpenFeed={onOpenFeed} onOpenPublish={onOpenPublish} />);

    fireEvent.click(screen.getByRole('button', { name: /necesito alojamiento/i }));

    expect(onOpenFeed).toHaveBeenCalledTimes(1);
    expect(onOpenPublish).not.toHaveBeenCalled();
  });

  it('opens the publish flow for offers when the offer CTA is clicked', () => {
    const onOpenFeed = vi.fn();
    const onOpenPublish = vi.fn();

    render(<HeroButtons onOpenFeed={onOpenFeed} onOpenPublish={onOpenPublish} />);

    fireEvent.click(screen.getByRole('button', { name: /tengo espacio disponible/i }));

    expect(onOpenPublish).toHaveBeenCalledWith('ofrezco');
    expect(onOpenFeed).not.toHaveBeenCalled();
  });
});
