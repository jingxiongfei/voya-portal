import { useEffect } from 'react';

const CONTENT_SELECTOR = '[data-voya-elastic-scroll-region]';
const TARGET_CLASS_NAME = 'voya-elastic-scroll-target';
const STATE_ATTRIBUTE = 'data-voya-elastic-scroll-state';
const OFFSET_PROPERTY = '--voya-elastic-scroll-offset';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const WHEEL_SETTLE_DELAY_MS = 100;
const SETTLE_FALLBACK_MS = 500;
const DEFAULT_MAX_OFFSET = 32;

type ScrollBoundary = {
  atBottom: boolean;
  atTop: boolean;
};

export const calculateElasticOffset = (distance: number, maxOffset: number) => {
  if (distance === 0 || maxOffset <= 0) {
    return 0;
  }

  const resistance = maxOffset * 3;
  return (
    Math.sign(distance) *
    maxOffset *
    (1 - Math.exp(-Math.abs(distance) / resistance))
  );
};

const getScrollBoundary = (): ScrollBoundary => {
  const scrollingElement =
    document.scrollingElement ?? document.documentElement;
  const maxScrollTop = Math.max(
    0,
    scrollingElement.scrollHeight - scrollingElement.clientHeight,
  );

  return {
    atTop: scrollingElement.scrollTop <= 1,
    atBottom: scrollingElement.scrollTop >= maxScrollTop - 1,
  };
};

const getMaxOffset = (target: HTMLElement) => {
  const controlHeight = Number.parseFloat(
    window.getComputedStyle(target).getPropertyValue('--ant-control-height'),
  );

  return Number.isFinite(controlHeight) && controlHeight > 0
    ? controlHeight
    : DEFAULT_MAX_OFFSET;
};

const normalizeWheelDelta = (event: WheelEvent) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
};

const getEventRegion = (eventTarget: EventTarget | null) => {
  const origin =
    eventTarget instanceof Element
      ? eventTarget
      : eventTarget instanceof Node
        ? eventTarget.parentElement
        : null;

  return origin?.closest<HTMLElement>(CONTENT_SELECTOR) ?? null;
};

export default function ElasticOverscroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const root = document.documentElement;
    let activeTarget: HTMLElement | null = null;
    let rawDistance = 0;
    let wheelSettleTimer: number | undefined;
    let settleFallbackTimer: number | undefined;
    let transitionTarget: HTMLElement | null = null;
    let transitionEndHandler: ((event: TransitionEvent) => void) | undefined;
    let touchStartY: number | undefined;
    let touchBoundary: 'top' | 'bottom' | undefined;
    let touchTarget: HTMLElement | null = null;

    const clearWheelSettleTimer = () => {
      if (wheelSettleTimer !== undefined) {
        window.clearTimeout(wheelSettleTimer);
        wheelSettleTimer = undefined;
      }
    };

    const clearSettlement = () => {
      if (settleFallbackTimer !== undefined) {
        window.clearTimeout(settleFallbackTimer);
        settleFallbackTimer = undefined;
      }
      if (transitionTarget && transitionEndHandler) {
        transitionTarget.removeEventListener(
          'transitionend',
          transitionEndHandler,
        );
      }
      transitionTarget = null;
      transitionEndHandler = undefined;
    };

    const resetTarget = (target = activeTarget) => {
      clearWheelSettleTimer();
      clearSettlement();
      if (target) {
        target.classList.remove(TARGET_CLASS_NAME);
        target.style.removeProperty(OFFSET_PROPERTY);
      }
      root.removeAttribute(STATE_ATTRIBUTE);
      activeTarget = null;
      rawDistance = 0;
    };

    const applyElasticOffset = (target: HTMLElement, distance: number) => {
      clearSettlement();
      if (activeTarget && activeTarget !== target) {
        activeTarget.classList.remove(TARGET_CLASS_NAME);
        activeTarget.style.removeProperty(OFFSET_PROPERTY);
      }

      activeTarget = target;
      const maxOffset = getMaxOffset(target);
      const boundedDistance = Math.max(
        -maxOffset * 6,
        Math.min(maxOffset * 6, distance),
      );
      rawDistance = boundedDistance;

      target.classList.add(TARGET_CLASS_NAME);
      target.style.setProperty(
        OFFSET_PROPERTY,
        `${calculateElasticOffset(boundedDistance, maxOffset)}px`,
      );
      root.setAttribute(STATE_ATTRIBUTE, 'pulling');
    };

    const settleElasticOffset = () => {
      clearWheelSettleTimer();
      if (!activeTarget) {
        return;
      }

      clearSettlement();
      const target = activeTarget;
      rawDistance = 0;
      root.setAttribute(STATE_ATTRIBUTE, 'settling');
      target.style.setProperty(OFFSET_PROPERTY, '0px');

      const completeSettlement = () => {
        clearSettlement();
        target.classList.remove(TARGET_CLASS_NAME);
        target.style.removeProperty(OFFSET_PROPERTY);
        if (activeTarget === target) {
          activeTarget = null;
        }
        root.removeAttribute(STATE_ATTRIBUTE);
      };

      transitionTarget = target;
      transitionEndHandler = (event) => {
        if (!event.propertyName || event.propertyName === 'transform') {
          completeSettlement();
        }
      };
      target.addEventListener('transitionend', transitionEndHandler);
      settleFallbackTimer = window.setTimeout(
        completeSettlement,
        SETTLE_FALLBACK_MS,
      );
    };

    const scheduleSettlement = () => {
      clearWheelSettleTimer();
      wheelSettleTimer = window.setTimeout(
        settleElasticOffset,
        WHEEL_SETTLE_DELAY_MS,
      );
    };

    const handleWheel = (event: WheelEvent) => {
      if (reducedMotion.matches) {
        resetTarget();
        return;
      }

      const target = getEventRegion(event.target);
      if (!target) {
        return;
      }

      const deltaY = normalizeWheelDelta(event);
      const { atTop, atBottom } = getScrollBoundary();
      const pullsPastTop = atTop && deltaY < 0;
      const pullsPastBottom = atBottom && deltaY > 0;

      if (!pullsPastTop && !pullsPastBottom) {
        if (activeTarget) {
          settleElasticOffset();
        }
        return;
      }

      const nextDirection = Math.sign(-deltaY);
      if (rawDistance !== 0 && Math.sign(rawDistance) !== nextDirection) {
        rawDistance = 0;
      }
      applyElasticOffset(target, rawDistance - deltaY);
      scheduleSettlement();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (reducedMotion.matches || event.touches.length !== 1) {
        touchStartY = undefined;
        touchBoundary = undefined;
        touchTarget = null;
        return;
      }

      touchTarget = getEventRegion(event.target);
      if (!touchTarget) {
        touchStartY = undefined;
        touchBoundary = undefined;
        return;
      }

      const { atTop, atBottom } = getScrollBoundary();
      touchStartY = event.touches[0]?.clientY;
      touchBoundary = atTop ? 'top' : atBottom ? 'bottom' : undefined;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (
        reducedMotion.matches ||
        touchStartY === undefined ||
        currentY === undefined ||
        touchBoundary === undefined ||
        touchTarget === null
      ) {
        return;
      }

      const distance = currentY - touchStartY;
      const pullsPastTop = touchBoundary === 'top' && distance > 0;
      const pullsPastBottom = touchBoundary === 'bottom' && distance < 0;
      if (pullsPastTop || pullsPastBottom) {
        applyElasticOffset(touchTarget, distance);
      }
    };

    const handleTouchEnd = () => {
      touchStartY = undefined;
      touchBoundary = undefined;
      touchTarget = null;
      settleElasticOffset();
    };

    const handleReducedMotionChange = () => {
      if (reducedMotion.matches) {
        resetTarget();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    reducedMotion.addEventListener('change', handleReducedMotionChange);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      reducedMotion.removeEventListener('change', handleReducedMotionChange);
      resetTarget();
    };
  }, []);

  return null;
}
