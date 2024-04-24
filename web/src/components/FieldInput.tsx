import React from 'react';
import { Message, useFormContext, ValidationRule } from 'react-hook-form';
import { Field } from './Field';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  name: string;
  validation?: {
    required?: Message | ValidationRule<boolean>;
    min?: ValidationRule<number | string>;
    max?: ValidationRule<number | string>;
    maxLength?: ValidationRule<number>;
    minLength?: ValidationRule<number>;
  };
}

export const FieldInput: React.FC<React.PropsWithChildren<Props>> = ({
  label,
  labelClassName,
  validation,
  name,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors['name']?.message;

  return (
    <Field
      label={label}
      labelClassName={labelClassName}
      error={typeof errorMessage === 'string' ? errorMessage : undefined}
    >
      <input
        autoComplete="off"
        {...props}
        {...register(name, { ...validation })}
      />
    </Field>
  );
};
