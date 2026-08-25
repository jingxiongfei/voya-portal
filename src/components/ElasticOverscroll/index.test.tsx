import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ElasticOverscroll, { calculateElasticOffset } from './index';

const setDocumentScrollState = ({
  clientHeight,
  scrollHeight,
  scrollTop,
}: {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}) => {
  Object.defineProperties(document.documentElement, {
    clientHeight: { configurable: true, value: clientHeight },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: { configurable: true, value: scrollTop, writable: true },
  });
};

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.removeAttribute('data-voya-elastic-scroll-state');
  document.querySelectorAll('.voya-elastic-scroll-target').forEach((target) => {
    target.classList.remove('voya-elastic-scroll-target');
  });
});

describe('calculateElasticOffset', () => {
  it('applies resistance and keeps the offset inside its maximum', () => {
    expect(calculateElasticOffset(120, 32)).toBeGreaterThan(0);
    expect(calculateElasticOffset(120, 32)).toBeLessThan(32);
    expect(calculateElasticOffset(-120, 32)).toBeLessThan(0);
    expect(calculateElasticOffset(-120, 32)).toBeGreaterThan(-32);
  });
});

describe('ElasticOverscroll', () => {
  it('pulls the main content at the top boundary and settles it back', () => {
    vi.useFakeTimers();
    setDocumentScrollState({
      clientHeight: 800,
      scrollHeight: 1200,
      scrollTop: 0,
    });

    const { container, unmount } = render(
      <>
        <ElasticOverscroll />
        <header data-testid="page-header" />
        <main data-voya-elastic-scroll-region>
          <div data-testid="detail-content" />
        </main>
      </>,
    );
    const content = container.querySelector<HTMLElement>(
      '[data-voya-elastic-scroll-region]',
    );
    const detailContent = container.querySelector<HTMLElement>(
      '[data-testid="detail-content"]',
    );

    fireEvent.wheel(detailContent as HTMLElement, {
      deltaMode: 0,
      deltaY: -120,
    });

    expect(content).not.toBeNull();
    expect(content).toHaveClass('voya-elastic-scroll-target');
    expect(
      Number.parseFloat(
        content?.style.getPropertyValue('--voya-elastic-scroll-offset') ?? '0',
      ),
    ).toBeGreaterThan(0);
    expect(document.documentElement).toHaveAttribute(
      'data-voya-elastic-scroll-state',
      'pulling',
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(
      content?.style.getPropertyValue('--voya-elastic-scroll-offset'),
    ).toBe('0px');
    expect(document.documentElement).toHaveAttribute(
      'data-voya-elastic-scroll-state',
      'settling',
    );

    fireEvent.transitionEnd(content as HTMLElement, {
      propertyName: 'transform',
    });

    expect(content).not.toHaveClass('voya-elastic-scroll-target');
    expect(document.documentElement).not.toHaveAttribute(
      'data-voya-elastic-scroll-state',
    );

    unmount();
  });

  it('keeps sticky navigation outside the elastic content region', () => {
    setDocumentScrollState({
      clientHeight: 800,
      scrollHeight: 1200,
      scrollTop: 0,
    });

    const { container } = render(
      <>
        <ElasticOverscroll />
        <nav data-testid="sticky-navigation" />
        <main data-voya-elastic-scroll-region />
      </>,
    );
    const stickyNavigation = container.querySelector<HTMLElement>(
      '[data-testid="sticky-navigation"]',
    );
    const content = container.querySelector<HTMLElement>(
      '[data-voya-elastic-scroll-region]',
    );

    fireEvent.wheel(stickyNavigation as HTMLElement, {
      deltaMode: 0,
      deltaY: -120,
    });

    expect(content).not.toHaveClass('voya-elastic-scroll-target');
    expect(
      content?.style.getPropertyValue('--voya-elastic-scroll-offset'),
    ).toBe('');
    expect(document.documentElement).not.toHaveAttribute(
      'data-voya-elastic-scroll-state',
    );
  });

  it('pulls the marked content upward at the bottom boundary', () => {
    vi.useFakeTimers();
    setDocumentScrollState({
      clientHeight: 800,
      scrollHeight: 1200,
      scrollTop: 400,
    });

    const { container } = render(
      <>
        <ElasticOverscroll />
        <main data-voya-elastic-scroll-region>
          <div data-testid="detail-content" />
        </main>
      </>,
    );
    const content = container.querySelector<HTMLElement>(
      '[data-voya-elastic-scroll-region]',
    );
    const detailContent = container.querySelector<HTMLElement>(
      '[data-testid="detail-content"]',
    );

    fireEvent.wheel(detailContent as HTMLElement, {
      deltaMode: 0,
      deltaY: 120,
    });

    expect(
      Number.parseFloat(
        content?.style.getPropertyValue('--voya-elastic-scroll-offset') ?? '0',
      ),
    ).toBeLessThan(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.transitionEnd(content as HTMLElement, {
      propertyName: 'transform',
    });

    expect(content).not.toHaveClass('voya-elastic-scroll-target');
  });
});
