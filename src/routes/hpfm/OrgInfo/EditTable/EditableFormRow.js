import React from 'react';
import { Form } from 'hzero-ui';
import { EditableContext } from './index';

const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create()(EditableRow);

export default EditableFormRow;
