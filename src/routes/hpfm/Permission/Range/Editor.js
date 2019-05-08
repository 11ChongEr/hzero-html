import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, notification, Switch, Table, Popconfirm, Icon } from 'hzero-ui';
import { isNumber, isEmpty } from 'lodash';

import { enableRender } from 'utils/renderer';
import { Content } from 'components/Page';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import Drawer from '../Drawer';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create({ fieldNameProp: null })
export default class DrawerForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTenantId: getCurrentOrganizationId(),
    };
    this.update = this.update.bind(this);
    this.create = this.create.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  state = {};

  componentDidMount() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  update() {
    const {
      form: { validateFields },
      dataSource,
      handleUpdate = e => e,
    } = this.props;
    const { cancel } = this;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        handleUpdate(
          {
            ...dataSource,
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            customRuleFlag: values.customRuleFlag ? 1 : 0,
          },
          () => {
            notification.success({
              message: intl.get('hzero.common.notification.success.save').d('保存成功'),
            });
            cancel();
          }
        );
      }
    });
  }

  create() {
    const {
      form: { validateFields },
      dataSource,
      handleCreate = e => e,
      handleSetEditorDataSource = e => e,
    } = this.props;
    // const { cancel } = this;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        handleCreate(
          {
            ...dataSource,
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            customRuleFlag: values.customRuleFlag ? 1 : 0,
          },
          res => {
            handleSetEditorDataSource(res);
            notification.success({
              message: intl.get('hzero.common.notification.success.create').d('创建成功'),
            });
          }
        );
      }
    });
  }

  cancel() {
    const {
      onCancel = e => e,
      form: { resetFields },
    } = this.props;
    resetFields();
    onCancel();
  }

  validator(rule, value, callback) {
    const {
      form: { getFieldValue = e => e },
    } = this.props;
    if (!isNumber(getFieldValue('tenantId'))) {
      callback(
        intl.get('hzero.common.validation.notNull', {
          name: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
        })
      );
    }
    callback();
  }

  onSelectRuleOk(selectedData = {}) {
    const { handleAddPermissionRel = e => e, dataSource = {} } = this.props;
    const { rangeId } = dataSource;
    handleAddPermissionRel({
      rangeId,
      ruleId: selectedData.ruleId,
    });
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  defaultTableRowKey = 'permissionRelId';

  render() {
    const {
      visible,
      processing = {},
      form: { getFieldDecorator = e => e },
      dataSource = {},
      permissionRelDataSource = [],
      handleDeletePermissionRel = e => e,
    } = this.props;
    const { currentTenantId } = this.state;
    const {
      rangeId,
      tableName,
      sqlId,
      serviceName,
      ruleName,
      description,
      enabledFlag = 1,
      customRuleFlag,
      tenantId,
      tenantName,
    } = dataSource;
    // 当前租户是否和数据中的租户对应
    const isCurrentTenant = tenantId !== undefined ? tenantId !== currentTenantId : false;
    const drawerProps = {
      title: isNumber(rangeId)
        ? intl.get('hpfm.permission.view.option.updateRangeTitle').d('修改屏蔽范围')
        : intl.get('hpfm.permission.view.option.createRangeTitle').d('添加屏蔽范围'),
      visible,
      anchor: 'right',
      onCancel: this.cancel.bind(this),
      footer: isCurrentTenant ? null : (
        <Fragment>
          <Button onClick={this.cancel.bind(this)} disabled={processing.save}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            type="primary"
            loading={processing.save || false}
            onClick={() => (isNumber(rangeId) ? this.update() : this.create())}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </Fragment>
      ),
      width: 550,
    };

    const tableProps = {
      dataSource: permissionRelDataSource || [],
      pagination: false,
      columns: [
        {
          title: intl.get('hpfm.permission.model.permission.ruleCode').d('规则编码'),
          width: 160,
          dataIndex: 'ruleCode',
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.ruleName').d('规则名称'),
          dataIndex: 'ruleName',
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          align: 'center',
          width: 60,
          render: enableRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          align: 'center',
          width: 50,
          render: (text, record) => {
            return isCurrentTenant ? null : (
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => handleDeletePermissionRel(record)}
              >
                <a>{<Icon type={processing.deletePermissionRel ? 'loading' : 'delete'} />}</a>
              </Popconfirm>
            );
          },
        },
      ],
      rowKey: this.defaultTableRowKey,
      loading: processing.queryPermissionRel,
      bordered: true,
    };

    return (
      <Drawer {...drawerProps}>
        <div>
          <Content>
            <Form>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名')}
                {...formLayout}
              >
                {getFieldDecorator('tableName', {
                  initialValue: tableName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名'),
                      }),
                    },
                  ],
                })(<Input disabled={isCurrentTenant} inputChinese={false} />)}
              </FormItem>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.sqlId').d('SQLID')}
                {...formLayout}
              >
                {getFieldDecorator('sqlId', {
                  initialValue: sqlId,
                })(<Input disabled={isCurrentTenant} />)}
              </FormItem>
              {!isTenantRoleLevel() && (
                <FormItem
                  label={intl.get('hpfm.permission.model.permission.tenant').d('租户')}
                  {...formLayout}
                >
                  {getFieldDecorator('tenantId', {
                    initialValue: tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
                        }),
                      },
                    ],
                  })(
                    <Lov textValue={tenantName} disabled={isNumber(rangeId)} code="HPFM.TENANT" />
                  )}
                </FormItem>
              )}
              <FormItem
                label={intl.get('hpfm.permission.model.permission.serviceName').d('服务名')}
                {...formLayout}
              >
                {getFieldDecorator('serviceName', {
                  initialValue: serviceName,
                })(
                  <Lov
                    disabled={isCurrentTenant}
                    textValue={serviceName}
                    code="HCNF.ROUTE.SERVICE_CODE"
                  />
                )}
              </FormItem>
              <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                {getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag === 1,
                  valuePropName: 'checked',
                })(<Switch disabled={isCurrentTenant} />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('hpfm.permission.model.permission.customRuleFlag')
                  .d('自定义规则标识')}
                {...formLayout}
              >
                {getFieldDecorator('customRuleFlag', {
                  initialValue: customRuleFlag === 1,
                  valuePropName: 'checked',
                })(<Switch disabled={isCurrentTenant} />)}
              </FormItem>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.description').d('描述')}
                {...formLayout}
              >
                {getFieldDecorator('description', {
                  initialValue: description,
                })(<Input disabled={isCurrentTenant} />)}
              </FormItem>
            </Form>
            {isNumber(rangeId) && (
              <Fragment>
                {isCurrentTenant ? null : (
                  <div className="action">
                    <Lov
                      textValue={ruleName}
                      isButton
                      type="primary"
                      icon="plus"
                      disabled={tenantId === undefined}
                      onOk={this.onSelectRuleOk.bind(this)}
                      style={{ marginRight: 8 }}
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      code="HPFM.PERMISSION_RULE"
                    >
                      {intl.get('hpfm.permission.view.option.add').d('添加屏蔽规则')}
                    </Lov>
                  </div>
                )}
                <br />
                <Table {...tableProps} />
              </Fragment>
            )}
          </Content>
        </div>
      </Drawer>
    );
  }
}
