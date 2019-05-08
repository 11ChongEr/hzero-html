import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

/**
 * 接收者类型维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 接收者类型
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'left',
    title: '',
    visible: false,
    onOk: e => e,
    onCancel: e => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, tableRecord } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          onOk({ ...tableRecord, ...values });
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, title, visible, form, tableRecord, onCancel, saveLoading } = this.props;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={saveLoading}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          {!isTenantRoleLevel() && (
            <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
              {getFieldDecorator('tenantId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.tenant.tag').d('租户'),
                    }),
                  },
                ],
                initialValue: tableRecord.tenantId,
              })(
                <Lov
                  disabled={!isUndefined(tableRecord.tenantId)}
                  code="HPFM.TENANT"
                  textValue={tableRecord.tenantName}
                />
              )}
            </Form.Item>
          )}
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeCode').d('接收者类型编码')}
            {...formLayout}
          >
            {getFieldDecorator('typeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hmsg.receiverType.model.receiverType.typeCode')
                      .d('接收者类型编码'),
                  }),
                },
              ],
              initialValue: tableRecord.typeCode,
            })(
              <Input
                trim
                typeCase="upper"
                inputChinese={false}
                disabled={!isUndefined(tableRecord.typeCode)}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeName').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('typeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.receiverType.model.receiverType.typeName').d('描述'),
                  }),
                },
              ],
              initialValue: tableRecord.typeName,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.receiverType.model.recieverType.routeName').d('服务')}
            {...formLayout}
          >
            {getFieldDecorator('routeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.receiverType.model.recieverType.routeName').d('服务'),
                  }),
                },
              ],
              initialValue: tableRecord.routeName,
            })(
              <Lov
                code={
                  isTenantRoleLevel() ? 'HCNF.ROUTE.SERVICE_CODE.ORG' : 'HCNF.ROUTE.SERVICE_CODE'
                }
                textValue={tableRecord.routeName}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.receiverType.model.recieverType.apiUrl').d('URL')}
            {...formLayout}
          >
            {getFieldDecorator('apiUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.receiverType.model.recieverType.apiUrl').d('URL'),
                  }),
                },
              ],
              initialValue: tableRecord.apiUrl,
            })(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(tableRecord.enabledFlag) ? 1 : tableRecord.enabledFlag,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
