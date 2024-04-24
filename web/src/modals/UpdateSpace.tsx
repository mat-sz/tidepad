import React, { useState } from 'react';

import { OrderItem } from '../sources/types';
import { FieldInput } from '../components/FieldInput';
import { useModalContext } from '../contexts/ModalContext';
import { BaseModal } from './BaseModal';

interface Inputs {
  name: string;
}

export const UpdateSpace: React.FC = () => {
  const { currentModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);

  const onUpdate: (id: number, name: string) => Promise<number | undefined> =
    currentModal?.payload.onUpdate;
  const space: OrderItem = currentModal?.payload.space;

  return (
    <BaseModal
      name="update_space"
      isLoading={isLoading}
      onSubmit={async (data: Inputs, { reset }) => {
        setIsLoading(true);
        await onUpdate(space?.id as number, data.name);
        setIsLoading(false);
        reset();
        closeModal();
      }}
      title="Update Space"
      showCancelButton
      submitButtonLabel="Update space"
      content={
        <FieldInput
          label="Space name"
          placeholder="space"
          defaultValue={space?.name}
          type="text"
          name="name"
          validation={{
            required: 'This field is required',
          }}
        />
      }
    />
  );
};
