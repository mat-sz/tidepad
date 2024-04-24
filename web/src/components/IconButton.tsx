import clsx from 'clsx';
import React from 'react';

import { BaseButton, BaseButtonProps } from './BaseButton';

export interface IconButtonProps extends BaseButtonProps {
  title: string;
}

export const IconButton: React.FC<React.PropsWithChildren<IconButtonProps>> = ({
  className,
  ...props
}) => {
  return <BaseButton className={clsx('button_icon', className)} {...props} />;
};
