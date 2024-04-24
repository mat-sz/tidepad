import React, { useState } from 'react';

import { FieldInput } from '../components/FieldInput';
import { useModalContext } from '../contexts/ModalContext';
import { BaseModal } from './BaseModal';

interface Inputs {
  name: string;
}

export const CreateCategory: React.FC = () => {
  const { currentModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);

  const onCreate: (name: string) => Promise<void> =
    currentModal?.payload.onCreate;

  return (
    <BaseModal
      name="create_category"
      isLoading={isLoading}
      onSubmit={async (data: Inputs, { reset }) => {
        setIsLoading(true);
        await onCreate(data.name);
        setIsLoading(false);
        reset();
        closeModal();
      }}
      title="Create Category"
      showCancelButton
      submitButtonLabel="Create category"
      content={
        <FieldInput
          label="Category name"
          placeholder="new category"
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
