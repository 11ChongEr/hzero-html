import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Divider, Spin } from 'hzero-ui';
import { isEmpty, map } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 },
};

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleAdd - 添加确定的回调函数
 * @reactProps {Function} handleEdit - 编辑确定的回调函数
 * @reactProps {Object} dataSourceDetail - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onOk(values);
      }
    });
  }

  /**
   * 获取连接池参数
   */
  @Bind()
  changeDbPoolType(value) {
    const { onGetDbPoolParams, dataSourceDetail = {} } = this.props;
    if (dataSourceDetail.dbPoolParams !== value) {
      onGetDbPoolParams(value);
    }
  }

  /**
   * 改变数据源类型,获取驱动类和连接字符串
   */
  @Bind()
  changeDbType(value) {
    const { onGetDriverClass, form } = this.props;
    onGetDriverClass(value, form);
  }

  render() {
    const {
      visible,
      onCancel,
      saving,
      dataSourceDetail,
      initLoading = false,
      dbPoolParams = {},
      dataSourceTypeList = [],
      dbPoolTypeList = [],
      dsPurposeCodeList = [],
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      datasourceId,
      dsPurposeCode,
      datasourceCode,
      username,
      passwordEncrypted,
      dbType,
      dbPoolType,
      description,
      remark,
      tenantId,
      tenantName,
      driverClass,
      datasourceUrl,
      enabledFlag = 1,
    } = dataSourceDetail;
    // 获取连接池参数
    const newDbPoolParams = map(dbPoolParams, (value, key) => {
      return { key, value };
    });
    return (
      <Modal
        destroyOnClose
        width={740}
        title={
          datasourceId === undefined
            ? intl.get('hpfm.dataSource.view.message.create').d('新建数据源')
            : intl.get('hpfm.dataSource.view.message.edit').d('编辑数据源')
        }
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        confirmLoading={saving}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
      >
        <Spin spinning={initLoading}>
          <Form>
            <Divider orientation="left">
              {intl.get('hrpt.reportDataSource.model.reportDataSource.baseParams').d('基本参数')}
            </Divider>
            {!isTenantRoleLevel() && (
              <FormItem label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                {getFieldDecorator('tenantId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.tenant.tag').d('租户'),
                      }),
                    },
                  ],
                  initialValue: tenantId,
                })(
                  <Lov
                    code="HPFM.TENANT"
                    textValue={tenantName}
                    disabled={datasourceId !== undefined}
                  />
                )}
              </FormItem>
            )}
            <FormItem
              label={intl.get('hpfm.dataSource.model.dataSource.datasourceCode').d('数据源编码')}
              {...formLayout}
            >
              {getFieldDecorator('datasourceCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.dataSource.model.dataSource.datasourceCode')
                        .d('数据源编码'),
                    }),
                  },
                ],
                initialValue: datasourceCode,
              })(
                <Input
                  trim
                  typeCase="upper"
                  inputChinese={false}
                  disabled={datasourceId !== undefined}
                />
              )}
            </FormItem>
            <FormItem
              label={intl.get('hpfm.ruleEngine.model.ruleEngine.description').d('数据源名称')}
              {...formLayout}
            >
              {getFieldDecorator('description', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.ruleEngine.model.ruleEngine.description')
                        .d('数据源名称'),
                    }),
                  },
                ],
                initialValue: description,
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl.get('hpfm.ruleEngine.model.dataSource.dbType').d('数据库类型')}
              {...formLayout}
            >
              {getFieldDecorator('dbType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.ruleEngine.model.dataSource.dbType').d('数据库类型'),
                    }),
                  },
                ],
                initialValue: dbType,
              })(
                <Select
                  allowClear={false}
                  onChange={this.changeDbType}
                  disabled={datasourceId !== undefined}
                >
                  {dataSourceTypeList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem
              label={intl
                .get('hrpt.reportDataSource.model.reportDataSource.driverClass')
                .d('驱动类')}
              {...formLayout}
            >
              {getFieldDecorator('driverClass', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSource.model.reportDataSource.driverClass')
                        .d('驱动类'),
                    }),
                  },
                ],
                initialValue: driverClass,
              })(<Input disabled />)}
            </FormItem>
            <FormItem
              label={intl.get('hpfm.dataSource.model.dataSource.datasourceUrl').d('URL地址')}
              {...formLayout}
            >
              {getFieldDecorator('datasourceUrl', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.dataSource.model.dataSource.datasourceUrl').d('URL地址'),
                    }),
                  },
                ],
                initialValue: datasourceUrl,
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl
                .get('hrpt.reportDataSource.model.reportDataSource.dbPoolType')
                .d('连接池类型')}
              {...formLayout}
            >
              {getFieldDecorator('dbPoolType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSource.model.reportDataSource.dbPoolType')
                        .d('连接池类型'),
                    }),
                  },
                ],
                initialValue: dbPoolType,
              })(
                <Select allowClear={false} onChange={this.changeDbPoolType}>
                  {dbPoolTypeList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem
              label={intl
                .get('hrpt.reportDataSource.model.reportDataSource.dsPurposeCode')
                .d('数据源用途')}
              {...formLayout}
            >
              {getFieldDecorator('dsPurposeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hrpt.reportDataSource.model.reportDataSource.dsPurposeCode')
                        .d('数据源用途'),
                    }),
                  },
                ],
                initialValue: dsPurposeCode,
              })(
                <Select allowClear={false} disabled={datasourceId !== undefined}>
                  {dsPurposeCodeList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem
              label={intl.get('hpfm.dataSource.model.dataSource.user').d('用户')}
              {...formLayout}
            >
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.dataSource.model.dataSource.user').d('用户'),
                    }),
                  },
                ],
                initialValue: username,
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl.get('hpfm.dataSource.model.dataSource.password').d('密码')}
              {...formLayout}
            >
              {getFieldDecorator('passwordEncrypted', {
                rules: [
                  {
                    required: datasourceId === undefined,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.dataSource.model.dataSource.password').d('密码'),
                    }),
                  },
                ],
                initialValue: passwordEncrypted,
              })(
                <Input
                  type="password"
                  placeholder={
                    datasourceId !== undefined
                      ? intl.get('hzero.common.validation.notChange').d('未更改')
                      : ''
                  }
                />
              )}
            </FormItem>
            <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
              {getFieldDecorator('remark', {
                initialValue: remark,
              })(<Input />)}
            </FormItem>
            <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag,
              })(<Switch />)}
            </FormItem>
            {!isEmpty(newDbPoolParams) ? (
              <Divider orientation="left">
                {intl
                  .get('hrpt.reportDataSource.model.reportDataSource.dbPoolParams')
                  .d('连接池参数')}
              </Divider>
            ) : (
              ''
            )}
            {!isEmpty(newDbPoolParams)
              ? newDbPoolParams.map(item => (
                  <FormItem label={`${item.key}`} {...formLayout} key={`${item.key}`}>
                    {getFieldDecorator(`${item.key}`, {
                      initialValue: `${item.value}`,
                    })(<Input />)}
                  </FormItem>
                ))
              : ''}
          </Form>
        </Spin>
      </Modal>
    );
  }
}
