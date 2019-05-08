import React from 'react';
import { Form } from 'hzero-ui';
import { isFunction } from 'lodash';
import { EditableContext } from './index';

const FormItem = Form.Item;
export default class EditableCell extends React.PureComponent {
  render() {
    const {
      editing,
      dataIndex,
      title,
      renderType,
      record,
      index,
      editable,
      rules,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {form => {
          const { getFieldDecorator } = form;
          return editing && isFunction(renderType) ? (
            <td {...restProps}>
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(dataIndex, {
                  rules,
                  initialValue: record[dataIndex],
                })(renderType(form, record))}
              </FormItem>
            </td>
          ) : (
            <td {...restProps}>{restProps.children}</td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}
