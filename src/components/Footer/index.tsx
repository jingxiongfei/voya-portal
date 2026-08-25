import { Divider, Space, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

const COMMIT_HASH = process.env.COMMIT_HASH || '';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    padding: 16px 24px;
    text-align: center;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeight};
    background: transparent;
  `,
}));

const Footer: React.FC = () => {
  const { styles } = useStyles();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Space size={8} wrap separator={<Divider orientation="vertical" />}>
        <Typography.Text type="secondary">
          Voya Explore &copy; {year}
        </Typography.Text>
        <Typography.Text type="secondary">
          Voya Portal {__APP_VERSION__}
        </Typography.Text>
        {COMMIT_HASH && (
          <Typography.Text type="secondary" code>
            {COMMIT_HASH.slice(0, 7)}
          </Typography.Text>
        )}
      </Space>
    </footer>
  );
};

export default Footer;
