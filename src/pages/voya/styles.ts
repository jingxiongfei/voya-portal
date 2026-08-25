import { createStyles } from 'antd-style';

export const useVoyaPageStyles = createStyles(({ token, css }) => ({
  stack: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginMD}px;
  `,
  metrics: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${token.marginMD}px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,
  metricCard: css`
    position: relative;
    overflow: hidden;
    min-height: 120px;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
    background: linear-gradient(
      145deg,
      ${token.colorBgContainer} 62%,
      ${token.colorPrimaryBg} 140%
    );

    &::before {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      width: 3px;
      background: ${token.colorPrimary};
      content: '';
    }
  `,
  metricIcon: css`
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: ${token.borderRadiusLG}px;
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
    font-size: 20px;
  `,
  surfaceCard: css`
    overflow: hidden;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
  `,
  filterCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
  `,
  dataCard: css`
    overflow: hidden;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
  `,
  sectionTitle: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
  sectionIcon: css`
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeLG}px;
  `,
  metricNote: css`
    display: block;
    margin-top: ${token.marginXS}px;
  `,
  filterGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(160px, 1fr));
    gap: 0 ${token.marginMD}px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(160px, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,
  filterActions: css`
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding-bottom: ${token.paddingXS}px;
  `,
  orderFilterGrid: css`
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    align-items: end;
    gap: ${token.marginXS}px ${token.marginSM}px;

    & > .ant-form-item {
      min-width: 0;
      margin-bottom: 0;
    }

    & > .ant-form-item .ant-form-item-label {
      padding-bottom: 2px;
    }

    & > .ant-form-item .ant-form-item-label > label {
      height: auto;
      font-size: ${token.fontSizeSM}px;
      line-height: ${token.lineHeightSM};
    }

    @media (max-width: 1600px) {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,
  orderFilterDateRange: css`
    grid-column: span 2;

    @media (max-width: 640px) {
      grid-column: span 1;
    }
  `,
  compactFilterActions: css`
    display: flex;
    min-height: 24px;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;
  `,
  receiptFilterGrid: css`
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    align-items: end;
    gap: ${token.marginXS}px ${token.marginSM}px;

    & > .ant-form-item {
      min-width: 0;
      margin-bottom: 0;
    }

    & > .ant-form-item .ant-form-item-label {
      padding-bottom: 2px;
    }

    & > .ant-form-item .ant-form-item-label > label {
      height: auto;
      font-size: ${token.fontSizeSM}px;
      line-height: ${token.lineHeightSM};
    }

    @media (max-width: 1200px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,
  receiptFilterDateRange: css`
    grid-column: span 2;

    @media (max-width: 640px) {
      grid-column: span 1;
    }
  `,
  receiptFilterActions: css`
    grid-column: span 2;
    display: flex;
    min-height: 24px;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;

    @media (max-width: 640px) {
      grid-column: span 1;
    }
  `,
  receiptBoundOrder: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXXS}px;
    white-space: nowrap;
  `,
  receiptRebindingButton: css`
    color: ${token.colorPrimary};
  `,
  receiptConvertedAmount: css`
    cursor: help;
    text-decoration-line: underline;
    text-decoration-style: dotted;
    text-decoration-thickness: ${token.lineWidth}px;
    text-underline-offset: ${token.marginXXS}px;
  `,
  receiptReboundOrderLink: css`
    &,
    &:hover,
    &:focus-visible {
      text-decoration-line: underline;
      text-decoration-style: dashed;
      text-decoration-thickness: ${token.lineWidth}px;
      text-underline-offset: ${token.marginXXS}px;
    }
  `,
  receiptBindingHistory: css`
    min-width: 280px;
    max-width: 360px;
  `,
  receiptBindingHistoryItem: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  receiptBindingHistoryRoute: css`
    display: grid;
    grid-template-columns: minmax(72px, auto) minmax(0, 1fr);
    gap: ${token.marginXXS}px ${token.marginSM}px;
  `,
  formGrid: css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 ${token.marginMD}px;

    & > .ant-form-item {
      min-width: 0;
      margin-bottom: ${token.marginSM}px;
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,
  fullWidth: css`
    width: 100%;
  `,
  noWrap: css`
    white-space: nowrap;
  `,
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    flex-wrap: wrap;
    margin-bottom: ${token.marginSM}px;
  `,
  titleCell: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
    min-width: 0;
  `,
  titleMeta: css`
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  `,
  muted: css`
    color: ${token.colorTextDescription};
  `,
  code: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorTextSecondary};
  `,
  dateTime: css`
    color: ${token.colorTextSecondary};
    white-space: nowrap;
  `,
  clickableRow: css`
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: -2px;
    }
  `,
  avatar: css`
    flex: 0 0 auto;
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
  `,
  detailGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
    gap: ${token.marginMD}px;

    @media (max-width: 1000px) {
      grid-template-columns: 1fr;
    }
  `,
  detailAnchorHost: css`
    display: contents;
  `,
  detailStack: css`
    padding-block-start: ${token.marginMD}px;
  `,
  detailHeaderShell: css`
    position: sticky;
    inset-block-start: var(--voya-global-header-height, 56px);
    z-index: ${token.zIndexPopupBase + 1};
    background: var(--voya-navigation-surface);
  `,
  detailPageHeader: css`
    box-sizing: border-box;
    overflow: hidden;
    padding: ${token.paddingSM}px ${token.paddingLG}px;
    border-start-start-radius: var(--voya-content-start-radius);
    background: ${token.colorBgContainer};
    box-shadow: inset 0 -1px 0 ${token.colorBorderSecondary};
  `,
  detailHeaderToolbar: css`
    min-width: 0;
  `,
  detailHeaderDivider: css`
    height: ${token.controlHeight}px;
    margin-inline: ${token.marginXXS}px;
  `,
  detailHeaderTitle: css`
    margin: ${token.marginSM}px 0 0 !important;
  `,
  detailAnchor: css`
    position: sticky;
    z-index: ${token.zIndexPopupBase};
    box-sizing: border-box;
    width: 100%;
    align-self: stretch;
    overflow-x: auto;
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    border: 0;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
    transition:
      width ${token.motionDurationMid} ${token.motionEaseOut},
      margin-inline ${token.motionDurationMid} ${token.motionEaseOut},
      padding-inline ${token.motionDurationMid} ${token.motionEaseOut},
      box-shadow ${token.motionDurationMid} ${token.motionEaseOut};
  `,
  detailAnchorStuck: css`
    width: calc(100% + ${token.paddingLG * 2}px);
    margin-inline: -${token.paddingLG}px;
    padding-inline: ${token.paddingSM + token.paddingLG}px;
  `,
  detailSection: css`
    scroll-margin-top: var(--voya-detail-section-offset, 161px);
  `,
  amountSummary: css`
    min-width: 180px;
    text-align: right;

    @media (max-width: 640px) {
      width: 100%;
      text-align: left;
    }
  `,
  amountValue: css`
    display: block;
    margin-top: ${token.marginXXS}px;
    color: ${token.colorText};
    font-size: ${token.fontSizeLG}px;
    line-height: ${token.lineHeightLG};
    font-variant-numeric: tabular-nums;
  `,
  couponRecord: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    flex-wrap: wrap;
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillAlter};
  `,
  routeStops: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXS}px;
  `,
  routeStop: css`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: ${token.marginSM}px;
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillAlter};
  `,
  routeStopBody: css`
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    flex-wrap: wrap;
  `,
  profileHeader: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
    min-width: 0;
  `,
  profileCard: css`
    overflow: hidden;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
    background: linear-gradient(
      135deg,
      ${token.colorBgContainer} 68%,
      ${token.colorPrimaryBg} 150%
    );
  `,
  profileIdentity: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
    min-width: 0;
  `,
  permissionPanel: css`
    padding: ${token.paddingSM}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  loginShell: css`
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(420px, 1.05fr) minmax(480px, 0.95fr);
    background: ${token.colorBgLayout};

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  `,
  loginStory: css`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
    padding: clamp(40px, 6vw, 88px);
    color: #ffffff;
    background:
      radial-gradient(circle at 80% 20%, rgba(117, 184, 255, 0.32), transparent 32%),
      radial-gradient(circle at 20% 85%, rgba(106, 230, 190, 0.2), transparent 36%),
      linear-gradient(145deg, #092a5e 0%, #124f91 55%, #147db1 100%);

    @media (max-width: 980px) {
      min-height: auto;
      padding: ${token.paddingXL}px;
    }
  `,
  loginPanel: css`
    position: relative;
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: ${token.paddingXL}px;
    background: ${token.colorBgContainer};

    @media (max-width: 980px) {
      min-height: auto;
      padding: 48px ${token.paddingLG}px;
    }
  `,
  loginFormWrap: css`
    width: min(100%, 430px);
  `,
  loginBrandLogo: css`
    display: inline-flex;
    height: 44px;
    align-items: center;
    align-self: flex-start;
    padding: 5px 10px;
    border-radius: ${token.borderRadius}px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 2px 8px rgba(9, 42, 94, 0.16);

    & .ant-image,
    & img {
      display: block;
    }
  `,
  loginStoryBody: css`
    @media (max-width: 980px) {
      display: none;
    }
  `,
  loginStoryFooter: css`
    @media (max-width: 980px) {
      display: none;
    }
  `,
}));
