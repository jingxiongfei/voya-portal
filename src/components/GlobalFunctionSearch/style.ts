import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  headerSlot: css`
    display: flex;
    height: 56px;
    align-items: center;
    padding-inline-start: 80px;

    @media (max-width: 1100px) {
      padding-inline-start: ${token.paddingLG}px;
    }

    @media (max-width: 768px) {
      display: none;
    }
  `,
  searchTrigger: css`
    width: min(360px, 100%);
    height: ${token.controlHeight}px;
    justify-content: flex-start;
    padding-inline: ${token.paddingSM}px;
    color: ${token.colorTextSecondary};
    background: rgba(20, 46, 77, 0.05);
    border-color: #ccd8e5;
    border-radius: 8px;
    box-shadow: none;

    &:hover,
    &:focus-visible {
      color: ${token.colorText};
      background: rgba(255, 255, 255, 0.9);
      border-color: ${token.colorPrimary};
    }
  `,
  triggerContent: css`
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    gap: ${token.marginXS}px;
  `,
  triggerText: css`
    overflow: hidden;
    flex: 1;
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  shortcut: css`
    flex: 0 0 auto;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
  `,
  modalInput: css`
    margin-block: ${token.marginXS}px ${token.marginSM}px;
  `,
  resultSummary: css`
    display: block;
    margin-block-end: ${token.marginXS}px;
    font-size: ${token.fontSizeSM}px;
  `,
  results: css`
    max-height: 384px;
    overflow-y: auto;
    padding-inline-end: 2px;
  `,
  resultItem: css`
    padding-block: 2px;
  `,
  resultButton: css`
    display: flex;
    width: 100%;
    height: auto;
    min-height: 58px;
    align-items: center;
    justify-content: flex-start;
    padding: ${token.paddingSM}px;
    text-align: start;

    > span:not(.ant-btn-icon) {
      display: contents;
    }
  `,
  resultIcon: css`
    display: inline-flex;
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    margin-inline-end: ${token.marginSM}px;
    border-radius: ${token.borderRadius}px;
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
    font-size: ${token.fontSizeLG}px;
  `,
  resultCopy: css`
    min-width: 0;
    flex: 1;
  `,
  resultArrow: css`
    flex: 0 0 auto;
    margin-inline-start: ${token.marginSM}px;
    color: ${token.colorTextDescription};
  `,
  empty: css`
    padding-block: ${token.paddingXL}px;
  `,
}));
