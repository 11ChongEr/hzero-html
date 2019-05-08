/**
 * DetailForm - 值集视图行编辑侧滑Form
 * @date: 2018-6-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import {
  Form,
  Input,
  Row,
  Radio,
  InputNumber,
  DatePicker,
  Select,
  Modal,
  Checkbox,
  Button,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';

import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 使用 Select 的 Option 组件
 */
const { Option } = Select;
/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * lov维护Form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DetailForm extends React.PureComponent {
  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    const { editRecordData, form } = this.props;
    form.setFieldsValue({
      ...editRecordData,
    });
  }

  /**
   * 点击确定后方法
   */
  @Bind()
  okHandle() {
    const { form, editRecordData } = this.props;
    this.props.formHook(form, editRecordData);
  }

  /**
   * 返回数据类型
   * @param {object} data 数据
   * @returns
   */
  @Bind()
  checkType(data) {
    return data.type === 'checkbox' ? 'checked' : 'value';
  }

  /**
   * 数据格式化，初始化默认数据
   * @param {object} data
   * @returns
   */
  @Bind()
  returnValue(data) {
    const { editRecordData } = this.props;
    if (data.type === 'switch' && data.defaultValue) {
      return editRecordData[`${data.dataIndex}`] === undefined
        ? data.defaultValue
          ? 1
          : 0
        : editRecordData[`${data.dataIndex}`];
    } else {
      return editRecordData[`${data.dataIndex}`];
    }
  }

  /**
   * 根据数据返回要渲染的form表单类型
   * @param {object} item
   * @returns
   */
  @Bind()
  renderFormInput(item) {
    const { isCurrentTenant } = this.props;
    const { type } = item;
    const formInputProps = { disabled: isCurrentTenant };
    switch (type) {
      case 'numberInput':
        return <InputNumber {...formInputProps} min={0} style={{ width: '50%' }} />;
      case 'date':
        return <DatePicker style={{ width: '50%' }} />;
      case 'select':
        return (
          <Select {...formInputProps}>
            {item.options.map(option => {
              return (
                <Option key={option} value={option}>
                  {option}
                </Option>
              );
            })}
          </Select>
        );
      case 'radio':
        return <Radio {...formInputProps} />;
      case 'checkbox':
        return <Checkbox {...formInputProps} />;
      case 'switch':
        return <Switch {...formInputProps} />;
      default:
        return <Input {...formInputProps} />;
    }
  }

  /**
   * 渲染函数
   * @returns
   */
  render() {
    const {
      form: { getFieldDecorator },
      modalVisible,
      handlecolumns,
      showEditModal,
      loading,
      isCurrentTenant,
    } = this.props;
    const columns = handlecolumns();
    return (
      <Modal
        visible={modalVisible}
        confirmLoading={loading}
        destroyOnClose
        onCancel={() => showEditModal(false)}
        footer={
          isCurrentTenant
            ? null
            : [
                <Button key="cancel" onClick={() => showEditModal(false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>,
                <Button key="on" type="primary" loading={loading} onClick={this.okHandle}>
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>,
              ]
        }
        {...otherProps}
      >
        <React.Fragment>
          {columns.map(data => {
            const required = data.required || false;
            if (data.editable) {
              return (
                <Row key={data.dataIndex} gutter={24}>
                  <FormItem
                    key={data.dataIndex}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                    label={data.title}
                  >
                    {getFieldDecorator(data.dataIndex, {
                      valuePropName: this.checkType(data),
                      initialValue: this.returnValue(data),
                      rules: [
                        {
                          required,
                          message: `${data.title}${intl
                            .get('hpfm.lov.view.message.detailForm')
                            .d('必须输入')}`,
                        },
                      ],
                    })(this.renderFormInput(data))}
                  </FormItem>
                </Row>
              );
            } else {
              return false;
            }
          })}
        </React.Fragment>
      </Modal>
    );
  }
}
