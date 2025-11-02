import React from 'react';
import { ReusableForm, FormField } from '../../../components/common/ReusableForm';

const studentFormFields: FormField[] = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'mobile', label: 'Mobile', required: true },
  { name: 'rollNo', label: 'Roll No', required: true },
];

export const AddEditStudent: React.FC = () => {
  return (
    <ReusableForm
      entityName="Student"
      fields={studentFormFields}
      fetchUrl="/api/users/getById"
      saveUrl="/api/users/save"
      updateUrl="/api/users/update"
      onSuccessUrl="StudentList"
    />
  );
};
