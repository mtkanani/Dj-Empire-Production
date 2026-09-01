import React from 'react';
import { Button } from '../common/Button.jsx';

export const LoadingButton = ({ children, loading = false, disabled = false, ...props }) => {
  return (
    <Button
      type="submit"
      variant="primary"
      fullWidth
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </Button>
  );
};
