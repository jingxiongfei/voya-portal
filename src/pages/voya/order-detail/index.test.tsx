import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from 'antd';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type CapturedPageContainerProps = {
  children?: ReactNode;
  fixedHeader?: boolean;
  pageHeaderRender?: () => ReactNode;
};

const pageContainerState = vi.hoisted(() => ({
  props: undefined as CapturedPageContainerProps | undefined,
}));
const routeState = vi.hoisted(() => ({ id: 'VO-20260821-1038' }));

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
  useModel: () => ({
    initialState: { currentUser: { name: 'Nora Liu' } },
  }),
  useParams: () => routeState,
}));

vi.mock('../payment-receipts/_mock', () => ({
  paymentReceipts: [
    {
      id: 'payment-VO-20260821-1038-01',
      amount: 80,
      currency: 'USD',
      exchangeRateToCny: 7.1824,
      method: 'creditCard',
      paidAt: '2026-08-21 09:33',
      transactionId: 'PAY-20260821-1038-01',
      orderId: 'VO-20260821-1038',
      bindingHistory: [],
    },
    {
      id: 'payment-VO-20260821-1038-02',
      amount: 48.5,
      currency: 'USD',
      exchangeRateToCny: 7.1824,
      method: 'digitalWallet',
      paidAt: '2026-08-21 09:35',
      transactionId: 'PAY-20260821-1038-02',
      orderId: 'VO-20260821-1038',
      bindingHistory: [],
    },
    {
      id: 'payment-VO-20260820-0974',
      amount: 97.2,
      currency: 'USD',
      exchangeRateToCny: 7.1824,
      method: 'creditCard',
      paidAt: '2026-08-20 18:56',
      transactionId: 'PAY-20260820-0974',
      orderId: 'VO-20260821-1038',
      bindingHistory: [
        {
          id: 'binding-payment-VO-20260820-0974-1',
          action: 'rebind',
          fromOrderId: 'VO-20260820-0974',
          toOrderId: 'VO-20260821-1038',
          operatedAt: '2026-08-21 09:31',
          operator: 'Nora Liu',
        },
      ],
    },
    {
      id: 'payment-VO-20260821-1031-01',
      amount: 620,
      currency: 'CNY',
      exchangeRateToCny: 1,
      method: 'digitalWallet',
      paidAt: '2026-08-21 08:48',
      transactionId: 'PAY-20260821-1031',
      orderId: 'VO-20260821-1031',
      bindingHistory: [],
    },
    {
      id: 'payment-VO-20260818-0864-01',
      amount: 88.2,
      currency: 'EUR',
      exchangeRateToCny: 8.34,
      processingFee: 2.65,
      method: 'digitalWallet',
      paidAt: '2026-08-18 17:44',
      transactionId: 'PAY-20260818-0864',
      orderId: 'VO-20260818-0864',
      bindingHistory: [],
    },
  ],
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
  beforeEach(() => {
    routeState.id = 'VO-20260821-1038';
  });

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

  it('shows the amount payable in the order summary', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const amountSummary = container.querySelector('.amountSummary');

    expect(amountSummary).not.toBeNull();
    expect(
      within(amountSummary as HTMLElement).getByText(
        'voya.order.summaryPayableAmount',
      ),
    ).toBeInTheDocument();
    expect(
      within(amountSummary as HTMLElement).getByText('138.5'),
    ).toBeInTheDocument();
  });

  it('aligns payment status metadata and shows the payment deadline', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const orderSummaryMeta = container.querySelector('.orderSummaryMeta');

    expect(orderSummaryMeta).not.toBeNull();
    expect(orderSummaryMeta).toHaveClass('ant-flex-align-center');
    expect(
      within(orderSummaryMeta as HTMLElement)
        .getByText('voya.order.paymentTimeRemaining')
        .closest('.ant-typography-danger'),
    ).not.toBeNull();
    expect(
      within(orderSummaryMeta as HTMLElement).getByText(
        'voya.order.paymentDeadline',
      ),
    ).toBeInTheDocument();
    expect(
      within(orderSummaryMeta as HTMLElement).getByText(
        new Date('2026-08-21T10:02').toISOString(),
      ),
    ).toBeInTheDocument();
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

  it('renders rebound payment provenance as read-only text instead of a tag', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const paymentSection = container.querySelector('#payment-info');

    expect(paymentSection).not.toBeNull();
    const provenance = within(paymentSection as HTMLElement).getByText(
      'voya.order.paymentReboundSource',
    );
    expect(provenance).toHaveClass('ant-typography-secondary');
    expect(provenance.closest('.ant-tag')).toBeNull();
  });

  it('renders coupon usage as a negative payment detail row', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const paymentSection = container.querySelector('#payment-info');

    expect(paymentSection).not.toBeNull();
    expect(
      within(paymentSection as HTMLElement).getByRole('row', {
        name: /voya.order.paymentMethod.coupon -10 .*VOYA10/,
      }),
    ).toBeInTheDocument();
    expect(
      within(paymentSection as HTMLElement).queryByText(
        'voya.order.couponUsage',
      ),
    ).not.toBeInTheDocument();
  });

  it('does not paginate the payment details table', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const paymentSection = container.querySelector('#payment-info');

    expect(paymentSection).not.toBeNull();
    expect(
      (paymentSection as HTMLElement).querySelector('.ant-pagination'),
    ).not.toBeInTheDocument();
  });

  it('does not paginate the traveler table', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const travelerSection = container.querySelector('#traveler-info');

    expect(travelerSection).not.toBeNull();
    expect(
      (travelerSection as HTMLElement).querySelector('.ant-pagination'),
    ).not.toBeInTheDocument();
  });

  it('shows no procurement information while payment is still pending', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const procurementSection = container.querySelector('#procurement-info');

    expect(procurementSection).not.toBeNull();
    expect(
      within(procurementSection as HTMLElement).getByText(
        'voya.order.procurementUnavailableTitle',
      ),
    ).toBeInTheDocument();
    expect(
      within(procurementSection as HTMLElement).getByText(
        'voya.order.procurementAwaitingPayment',
      ),
    ).toBeInTheDocument();
    expect(
      within(procurementSection as HTMLElement).queryByText('PO-GLR-88241'),
    ).not.toBeInTheDocument();
  });

  it('opens matching guide quotations with collected CNY payment context', () => {
    routeState.id = 'VO-20260821-1031';
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const procurementSection = container.querySelector('#procurement-info');

    expect(procurementSection).not.toBeNull();
    expect(
      within(procurementSection as HTMLElement).getByText('Voya Direct'),
    ).toBeInTheDocument();
    expect(
      within(procurementSection as HTMLElement).getByText('PO-VD-26082119'),
    ).toBeInTheDocument();

    fireEvent.click(
      within(procurementSection as HTMLElement).getByRole('button', {
        name: 'voya.order.procurementQuoteCount',
      }),
    );

    const quotationDrawer = screen.getByRole('dialog', {
      name: 'voya.order.procurementQuoteDrawerTitle',
    });
    expect(
      within(quotationDrawer).getByText('voya.order.procurementPaidCny'),
    ).toBeInTheDocument();
    expect(within(quotationDrawer).getByText('张伟')).toBeInTheDocument();
    expect(within(quotationDrawer).getByText('李敏')).toBeInTheDocument();
    expect(within(quotationDrawer).getByText('陈浩')).toBeInTheDocument();
    expect(within(quotationDrawer).getByText('沪A·D51827')).toBeInTheDocument();
    expect(
      within(quotationDrawer).getByText('Mercedes-Benz'),
    ).toBeInTheDocument();
    expect(within(quotationDrawer).getByText('V-Class')).toBeInTheDocument();
    expect(
      within(quotationDrawer).getByRole('row', {
        name: /voya.order.procurementSupplierQuote 520/,
      }),
    ).toBeInTheDocument();
    expect(
      within(quotationDrawer).getByRole('row', {
        name: /voya.order.procurementQuotePaymentCurrency 520/,
      }),
    ).toBeInTheDocument();
    expect(
      within(quotationDrawer).queryByText('voya.order.procurementQuotedAt'),
    ).not.toBeInTheDocument();

    const selectQuoteButtons = within(quotationDrawer).getAllByRole('button', {
      name: 'voya.order.procurementSelectQuote',
    });
    expect(selectQuoteButtons).toHaveLength(3);
    fireEvent.click(selectQuoteButtons[0]);
    expect(
      within(quotationDrawer).getByRole('button', {
        name: /voya.order.procurementQuoteSelected/,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows fulfilled procurement, guide, margin and previewable vehicle details', () => {
    routeState.id = 'VO-20260818-0864';
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const procurementSection = container.querySelector('#procurement-info');

    expect(procurementSection).not.toBeNull();
    const section = procurementSection as HTMLElement;
    expect(within(section).getByText('LocalLink')).toBeInTheDocument();
    expect(within(section).getByText('PO-LL-71654')).toBeInTheDocument();
    expect(
      within(section).getByText('voya.order.procurementPurchasePrice'),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('group', {
        name: 'voya.order.procurementFormulaAria',
      }),
    ).toBeInTheDocument();
    expect(within(section).getByText('Daniel Price')).toBeInTheDocument();
    expect(within(section).getByText('4.8')).toBeInTheDocument();
    expect(
      within(section).getByText('Mercedes-Benz V-Class'),
    ).toBeInTheDocument();
    expect(within(section).getByText('LM26 VOY')).toBeInTheDocument();
    expect(within(section).getAllByText('+44 7700 900 817')).toHaveLength(2);
    expect(
      within(section).getByText('voya.order.procurementVehiclePreviewHint'),
    ).toBeInTheDocument();
    expect(section.querySelectorAll('.procurementSubsection')).toHaveLength(2);
    expect(section.querySelectorAll('.ant-descriptions-bordered')).toHaveLength(
      2,
    );
    expect(section.querySelector('.procurementVehicleLayout')).not.toBeNull();

    const vehicleImage = within(section).getByAltText(
      'voya.order.procurementVehiclePhotoAlt',
    );
    expect(vehicleImage).toHaveAttribute(
      'src',
      '/vehicles/guide-vehicle-v-class.jpg',
    );
    const imageWrapper = vehicleImage.closest('.ant-image');
    expect(imageWrapper).not.toBeNull();
    expect(imageWrapper).not.toHaveClass('ant-image-preview-disabled');
  });

  it('uses one neutral color treatment for every header action button', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const toolbar = container.querySelector('.detailHeaderToolbar');

    expect(toolbar).not.toBeNull();
    const actionButtons = within(toolbar as HTMLElement)
      .getAllByRole('button')
      .slice(1);
    expect(actionButtons).toHaveLength(5);
    expect(
      actionButtons.every(
        (button) => !button.classList.contains('ant-btn-dangerous'),
      ),
    ).toBe(true);
  });

  it('provides a neutral payment collection action', () => {
    const { container } = render(
      <App>
        <OrderDetailPage />
      </App>,
    );
    const toolbar = container.querySelector('.detailHeaderToolbar');

    expect(toolbar).not.toBeNull();
    const collectButton = within(toolbar as HTMLElement).getByRole('button', {
      name: /voya.order.action.collect/,
    });
    expect(collectButton).not.toHaveClass('ant-btn-dangerous');
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
