import React, { useState } from 'react';

import { FieldInput } from '../components/FieldInput';
import { useModalContext } from '../contexts/ModalContext';
import { BaseModal } from './BaseModal';
import { OrderItem } from '../sources/types';
import { Button } from '../components/Button';

interface Inputs {
  name: string;
}

export const UpdateCategory: React.FC = () => {
  const { currentModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);

  const onUpdate: (id: string, name: string) => Promise<void> =
    currentModal?.payload.onUpdate;
  const onDelete: (id: string) => Promise<void> =
    currentModal?.payload.onDelete;
  const category: OrderItem = currentModal?.payload.category;

  return (
    <BaseModal
      name="update_category"
      isLoading={isLoading}
      onSubmit={async (data: Inputs, { reset }) => {
        setIsLoading(true);
        await onUpdate(category?.id as string, data.name);
        setIsLoading(false);
        reset();
        closeModal();
      }}
      title="Update Category"
      showCancelButton
      submitButtonLabel="Update category"
      secondaryActions={
        <Button
          variant="secondary-danger"
          onClick={async () => {
            setIsLoading(true);
            await onDelete(category?.id as string);
            setIsLoading(false);
            closeModal();
          }}
        >
          Delete category
        </Button>
      }
      content={
        <FieldInput
          label="Category name"
          placeholder="category"
          type="text"
          name="name"
          defaultValue={category?.name}
          validation={{
            required: 'This field is required',
          }}
        />
      }
    />
  );
};
