import { describe, expect, it } from 'vitest';
import { compactTablePagination, defaultTablePagination } from './components';

describe('Voya table pagination', () => {
  it('keeps pagination navigation visible for single-page tables', () => {
    expect(defaultTablePagination.hideOnSinglePage).toBe(false);
    expect(compactTablePagination.hideOnSinglePage).toBe(false);
  });

  it('provides full navigation controls for list pages', () => {
    expect(defaultTablePagination).toMatchObject({
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
      showQuickJumper: true,
      showSizeChanger: true,
    });
  });
});
