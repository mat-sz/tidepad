import clsx from 'clsx';
import React from 'react';

interface Props {
  label?: string;
  error?: string;
  labelClassName?: string;
}

export const Field: React.FC<React.PropsWithChildren<Props>> = ({
  label,
  error,
  labelClassName,
  children,
}) => {
  return (
    <label className={clsx('field', labelClassName)}>
      <span>{label}</span>
      {children}
      {error && <span className="field_error">{error}</span>}
    </label>
  );
};
