import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FieldInput } from '../components/FieldInput';
import { useModalContext } from '../contexts/ModalContext';
import { BaseModal } from './BaseModal';

interface Inputs {
  name: string;
}

export const CreateSpace: React.FC = () => {
  const { currentModal, closeModal } = useModalContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onCreate: (name: string) => Promise<number | undefined> =
    currentModal?.payload.onCreate;

  return (
    <BaseModal
      name="create_space"
      isLoading={isLoading}
      onSubmit={async (data: Inputs, { reset }) => {
        setIsLoading(true);
        const spaceId = await onCreate(data.name);
        setIsLoading(false);
        reset();
        if (spaceId) {
          navigate(`/space/${spaceId}`);
        }
        closeModal();
      }}
      title="Create Space"
      showCancelButton
      submitButtonLabel="Create space"
      content={
        <FieldInput
          label="Space name"
          placeholder="new space"
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
