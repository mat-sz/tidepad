import clsx from 'clsx';
import React from 'react';
import { IconButton } from './IconButton';

interface Action {
  key: string | number;
  label: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  hidden?: boolean;
}

interface Props {
  className?: string;
  actions?: Action[];
}

export const QUICK_ACTIONS_CONTAINER_CLASS = 'quick-actions-container';
export const QUICK_ACTIONS_SHOW_ON_HOVER_CLASS = 'quick-actions-show-on-hover';

export const QuickActions: React.FC<Props> = ({ className, actions }) => {
  return (
    <div className={clsx('quick-actions', className)}>
      {actions?.map(action =>
        action.hidden ? null : (
          <IconButton
            title={action.label}
            onClick={action.onClick}
            key={action.key}
          >
            {action.icon}
          </IconButton>
        )
      )}
    </div>
  );
};
