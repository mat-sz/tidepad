import React from 'react';

import { Modal, ModalProps } from '../components/Modal';
import { useModalContext } from '../contexts/ModalContext';

interface Props extends Omit<ModalProps, 'isOpen' | 'onClose'> {
  name: string;
}

export const BaseModal: React.FC<Props> = ({ name, ...props }) => {
  const { currentModal, closeModal } = useModalContext();

  if (currentModal?.name !== name) {
    return null;
  }

  return <Modal isOpen onClose={closeModal} {...props} />;
};
