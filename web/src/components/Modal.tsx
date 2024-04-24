import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FormProvider, useForm } from 'react-hook-form';

import { Loading } from './Loading';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { Portal } from './Portal';
import { preventDefault } from '../helpers';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: (data: any, methods: { reset: () => void }) => void;
  showCancelButton?: boolean;
  submitButtonLabel?: React.ReactNode;
  submitButtonVariant?: 'primary' | 'danger' | 'success';
  isLoading?: boolean;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isLoading,
  content,
  actions,
  showCancelButton,
  submitButtonLabel,
  submitButtonVariant = 'success',
  secondaryActions,
}) => {
  const methods = useForm();

  const wrappedOnClose = () => {
    if (!isLoading) {
      onClose();
    } else {
      // TODO: indicate loading?
    }
  };

  return (
    <Portal isOpen={isOpen}>
      <div
        className="overlay"
        onClick={e => {
          if (e.target === e.currentTarget) {
            wrappedOnClose();
          }
        }}
      >
        <div className="modal">
          <div className="modal_title">
            <h2>{title}</h2>
            <IconButton title="Close" onClick={wrappedOnClose}>
              <IoClose />
            </IconButton>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={
                onSubmit
                  ? methods.handleSubmit(data =>
                      onSubmit(data, { reset: methods.reset })
                    )
                  : preventDefault
              }
            >
              {isLoading ? (
                <div className="flex_center">
                  <Loading />
                </div>
              ) : (
                <div className="modal_content">{content}</div>
              )}
              <div className="modal_actions">
                <div className="modal_secondary_actions">
                  {secondaryActions}
                </div>
                {showCancelButton && (
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                {actions}
                {submitButtonLabel && (
                  <Button
                    submit
                    variant={submitButtonVariant}
                    disabled={isLoading}
                  >
                    {submitButtonLabel}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Portal>
  );
};
