import React from 'react';

interface Props {
  className?: string;
  href?: string;
}

export const Link: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  href,
  children,
}) => {
  return (
    <a
      href={href}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
};
