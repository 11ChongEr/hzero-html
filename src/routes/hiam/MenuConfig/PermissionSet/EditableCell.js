import React, { PureComponent } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import { isFunction, toSafeInteger, isInteger } from 'lodash';
import intl from 'utils/intl';

const FormItem = Form.Item;

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const commonPrompt = 'hzero.common';

export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);
    this.getFormItem = this.getFormItem.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside(e) {
    const {
      form: { validateFields = o => o },
    } = this.props;
    if (
      this.cell !== e.target &&
      (this.cell && isFunction(this.cell.contains)) &&
      !this.cell.contains(e.target)
    ) {
      validateFields();
    }
  }

  parserSort(value) {
    return toSafeInteger(value);
  }

  codeValidator(rule, value, callback) {
    if (!/^[a-z]([-.a-z0-9]*[a-z0-9])$/.test(value)) {
      callback(intl.get(`${viewMessagePrompt}.error.codeIsNotCorrect`).d('编码格式不正确'));
    }
    callback();
  }

  // /^[a-z]([-.a-z0-9]*[a-z0-9])$/.test(value)
  getFormItem() {
    const {
      form: { getFieldDecorator = e => e },
      dataIndex,
      title,
      record,
      text,
    } = this.props;
    const defaultFormItem = {
      code: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            rules: [
              {
                required: true,
                message: intl
                  .get(`${commonPrompt}.validation.requireInput`, {
                    name: title,
                  })
                  .d(`请输入${title}`),
              },
              {
                validator: this.codeValidator.bind(this),
              },
            ],
            initialValue: record[dataIndex],
          })(
            <Input
              typeCase="lower"
              disabled={isInteger(Number(record.id))}
              style={{ width: 120 }}
            />
          )}
        </FormItem>
      ),
      name: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            rules: [
              {
                required: true,
                message: intl
                  .get(`${commonPrompt}.validation.requireInput`, {
                    name: title,
                  })
                  .d(`请输入${title}`),
              },
            ],
            initialValue: record[dataIndex],
          })(<Input style={{ width: 120 }} />)}
        </FormItem>
      ),
      sort: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            initialValue: isInteger(record[dataIndex]) ? record[dataIndex] : 0,
          })(
            <InputNumber
              style={{ width: 60 }}
              min={0}
              step={1}
              parser={this.parserSort.bind(this)}
            />
          )}
        </FormItem>
      ),
      description: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            initialValue: record[dataIndex],
          })(<Input style={{ width: 120 }} />)}
        </FormItem>
      ),
      // controllerType: () => (
      //   <FormItem style={{ marginBottom: 0 }}>
      //     {getFieldDecorator(dataIndex, {
      //       initialValue: record[dataIndex],
      //     })(
      //       <Select style={{ width: '100%' }}>
      //         <Select.Option value="hidden" key="hidden">
      //           隐藏
      //         </Select.Option>
      //         <Select.Option value="disabled" key="disabled">
      //           禁用
      //         </Select.Option>
      //       </Select>
      //     )}
      //   </FormItem>
      // ),
    };
    return isFunction(defaultFormItem[dataIndex]) ? defaultFormItem[dataIndex]() : text;
  }

  render() {
    // const { children } = this.props;
    return (
      <div
        ref={node => {
          this.cell = node;
        }}
        className="editable-cell"
      >
        {this.getFormItem()}
      </div>
    );
  }
}
