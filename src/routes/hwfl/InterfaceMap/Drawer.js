import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

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
    const { interfaceMappingId, objectVersionNumber } = tableRecord;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd(values);
        } else {
          onEdit({ interfaceMappingId, objectVersionNumber, ...values });
        }
      }
    });
  }

  /**
   *改变服务名称的值
   * @memberof Drawer
   */
  @Bind()
  changeServiceId() {
    const { getFieldValue, setFieldsValue } = this.props.form;
    if (getFieldValue('url') || getFieldValue('description')) {
      setFieldsValue({ url: undefined, description: undefined });
    }
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
    const { onCheck } = this.props;
    onCheck(rule, value, callback);
  }

  render() {
    const {
      drawerVisible,
      onCancel,
      saving,
      anchor,
      tableRecord = {},
      isCreate,
      scopeList,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    return (
      <Modal
        destroyOnClose
        width={520}
        title={
          isCreate
            ? intl.get('hwfl.interfaceMap.view.message.create').d('新建接口映射')
            : intl.get('hwfl.interfaceMap.view.message.edit').d('编辑接口映射')
        }
        visible={drawerVisible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.code').d('接口编码')}
            {...formLayout}
          >
            {getFieldDecorator('code', {
              validateFirst: true,
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.interfaceMap.model.interfaceMap.code').d('接口编码'),
                  }),
                },
                {
                  validator: isCreate ? this.checkUniqueCode : '',
                },
              ],
              initialValue: tableRecord ? tableRecord.code : '',
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.serviceId').d('服务Id')}
            {...formLayout}
          >
            {getFieldDecorator('serviceId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.interfaceMap.model.interfaceMap.serviceId').d('服务Id'),
                  }),
                },
              ],
              initialValue: tableRecord.serviceId,
            })(
              <Lov
                code="HCNF.ROUTE.SERVICE_CODE.ORG"
                textValue={tableRecord.serviceId}
                onChange={this.changeServiceId}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.url').d('接口地址')}
            {...formLayout}
          >
            {getFieldDecorator('url', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.interfaceMap.model.interfaceMap.url').d('接口地址'),
                  }),
                },
              ],
              initialValue: tableRecord.url,
            })(
              <Lov
                code="HIAM.INTERFACE_PERMISSION"
                queryParams={{
                  level: 'organization',
                  serviceName: getFieldValue('serviceId'),
                }}
                textValue={tableRecord.url}
                onChange={(text, record) => {
                  setFieldsValue({ description: record.description });
                }}
                disabled={isUndefined(getFieldValue('serviceId'))}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.description').d('接口说明')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfl.interfaceMap.model.interfaceMap.description')
                      .d('接口说明'),
                  }),
                },
              ],
              initialValue: tableRecord.description ? tableRecord.description : '',
            })(<Input disabled={isUndefined(getFieldValue('serviceId'))} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.scope').d('数据范围')}
            {...formLayout}
          >
            {getFieldDecorator('scope', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.interfaceMap.model.interfaceMap.scope').d('数据范围'),
                  }),
                },
              ],
              initialValue: tableRecord.scope,
            })(
              <Select disabled={!isCreate}>
                {scopeList &&
                  scopeList.map(item => (
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
