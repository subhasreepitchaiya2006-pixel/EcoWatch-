import React from 'react';
import { render } from '@testing-library/react';
import useOnMount from '../useOnMount';

describe('useOnMount', () => {
  test('runs callback on mount and cleanup on unmount', () => {
    let mounted = false;
    let cleaned = false;

    function TestComp() {
      useOnMount(() => {
        mounted = true;
        return () => { cleaned = true; };
      });
      return <div>ok</div>;
    }

    const { unmount } = render(<TestComp />);
    expect(mounted).toBe(true);
    unmount();
    expect(cleaned).toBe(true);
  });
});
