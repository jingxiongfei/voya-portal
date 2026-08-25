import { render, within } from '@testing-library/react';
import { App } from 'antd';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

type CapturedPageContainerProps = {
  children?: ReactNode;
  fixedHeader?: boolean;
  pageHeaderRender?: () => ReactNode;
};

const pageContainerState = vi.hoisted(() => ({
  props: undefined as CapturedPageContainerProps | undefined,
}));

vi.mock('@ant-design/pro-components', () => ({
  PageContainer: (props: CapturedPageContainerProps) => {
    pageContainerState.props = props;
    return (
      <main data-testid="page-container">
        {props.pageHeaderRender?.()}
        {props.children}
      </main>
    );
  },
}));

vi.mock('@umijs/max', () => ({
  history: { push: vi.fn() },
  useIntl: () => ({
    formatDate: (value: Date) => value.toISOString(),
    formatMessage: ({ id }: { id: string }) => id,
    formatNumber: (value: number) => String(value),
  }),
  useParams: () => ({ id: 'VO-20260821-1038' }),
}));

vi.mock('../styles', () => ({
  useVoyaPageStyles: () => ({
    styles: new Proxy<Record<string, string>>(
      {},
      {
        get: (_, key) => String(key),
      },
    ),
  }),
}));

import enVoyaMessages from '../../../locales/en-US/voya';
import zhVoyaMessages from '../../../locales/zh-CN/voya';
import OrderDetailPage from './index';

describe('OrderDetailPage sticky header', () => {
  it('keeps the detail header out of the state-switching Affix wrapper', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );

    expect(pageContainerState.props?.fixedHeader).toBeUndefined();
    expect(container.querySelector('.detailHeaderShell')).toBeInTheDocument();
    expect(container.querySelector('.detailPageHeader')).toBeInTheDocument();
  });

  it('renders one table row for every payment transaction', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const paymentSection = container.querySelector('#payment-info');

    expect(paymentSection).not.toBeNull();
    expect(
      within(paymentSection as HTMLElement).getByText('PAY-20260821-1038-01'),
    ).toBeInTheDocument();
    expect(
      within(paymentSection as HTMLElement).getByText('PAY-20260821-1038-02'),
    ).toBeInTheDocument();
  });

  it('warns that voiding does not refund payments and unlinks transactions', () => {
    expect(zhVoyaMessages['voya.order.action.voidDescription']).toContain(
      '不会自动退款',
    );
    expect(zhVoyaMessages['voya.order.action.voidDescription']).toContain(
      '解除绑定',
    );
    expect(enVoyaMessages['voya.order.action.voidDescription']).toContain(
      'not automatically refund',
    );
    expect(enVoyaMessages['voya.order.action.voidDescription']).toContain(
      'unlinked',
    );
  });
});
