import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAdd - 添加确定的回调函数
 * @reactProps {Function} onEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  onOk() {
    const { form, onAdd, isCreate, tableRecord, onEdit } = this.props;
    const { processVariableId, objectVersionNumber } = tableRecord;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd(values);
        } else {
          onEdit({ processVariableId, objectVersionNumber, ...values });
        }
      }
    });
  }

  /**
   * 校验编码唯一性
   *
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   * @memberof Drawer
   */
  @Bind()
  checkUniqueCode(rule, value, callback) {
    const {
      onCheck,
      form: { getFieldValue },
    } = this.props;
    const codeValue = getFieldValue('code');
    onCheck(rule, value, callback, codeValue);
  }

  render() {
    const {
      scopeType,
      visible,
      onCancel,
      saving,
      anchor,
      tableRecord,
      isCreate,
      typeList,
      category,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        width={520}
        title={
          isCreate
            ? intl.get('hwfl.processVariable.view.message.create').d('新建流程变量')
            : intl.get('hwfl.processVariable.view.message.edit').d('编辑流程变量')
        }
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem label={intl.get('hwfl.common.model.common.code').d('编码')} {...formLayout}>
            {getFieldDecorator('code', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.common.code').d('编码'),
                  }),
                },
                {
                  validator: isCreate ? this.checkUniqueCode : '',
                },
              ],
              initialValue: tableRecord ? tableRecord.code : '',
            })(<Input trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.common.model.common.description').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.common.description').d('描述'),
                  }),
                },
              ],
              initialValue: tableRecord.description ? tableRecord.description : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.processVariable.model.processVariable.parameterType').d('类型')}
            {...formLayout}
          >
            {getFieldDecorator('parameterType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfl.processVariable.model.processVariable.parameterType')
                      .d('类型'),
                  }),
                },
              ],
              initialValue: tableRecord.parameterType ? tableRecord.parameterType : '',
            })(
              <Select allowClear>
                {typeList &&
                  typeList.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.common.model.process.class').d('流程分类')}
            {...formLayout}
          >
            {getFieldDecorator('category', {
              // rules: [
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl
              //         .get('hwfl.common.model.process.class')
              //         .d('流程分类'),
              //     }),
              //   },
              // ],
              initialValue: tableRecord.category,
            })(
              <Select allowClear>
                {category &&
                  category.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.processVariable.model.processVariable.scope').d('数据范围')}
            {...formLayout}
          >
            {getFieldDecorator('scope', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfl.processVariable.model.processVariable.scope')
                      .d('数据范围'),
                  }),
                },
              ],
              initialValue: tableRecord.scope,
            })(
              <Select disabled={!isCreate}>
                {scopeType &&
                  scopeType.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
