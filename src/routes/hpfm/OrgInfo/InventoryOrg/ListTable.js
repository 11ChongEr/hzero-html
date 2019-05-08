/**
 * InventoryOrg -库存组织页面 -表格部分
 * @date: 2018-11-5
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Input } from 'hzero-ui';
import classnames from 'classnames';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import styles from '../index.less';

export default class ListTable extends Component {
  render() {
    const {
      pagination = {},
      fetchInventoryData = {},
      fetchInventoryDataLoading,
      getOrganizationId,
      onFetchInventory,
      onHandleCancelOrg,
      onHandleOrgEdit,
    } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.organizationCode').d('库存组织编码'),
        dataIndex: 'organizationCode',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('organizationCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.inventoryOrg.model.inventoryOrg.organizationCode')
                          .d('库存组织编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_.]*$/,
                      message: intl.get('hzero.common.validation.code').d('格式不正确'),
                    },
                  ],
                  initialValue: val,
                })(
                  <Input
                    trim
                    typeCase="upper"
                    inputChinese={false}
                    disabled={record.organizationCode}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.organizationName').d('库存组织名称'),
        dataIndex: 'organizationName',
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('organizationName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.inventoryOrg.model.inventoryOrg.organizationName')
                          .d('库存组织名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input disabled={record.sourceCode !== 'SRM'} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ouId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    textValue={record.ouName || ''}
                    disabled={record.sourceCode !== 'SRM'}
                    style={{ width: '100%' }}
                    queryParams={{ organizationId: getOrganizationId }}
                    code="HPFM.OU"
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.ouName;
          }
        },
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.sourceCode').d('数据来源'),
        width: 100,
        align: 'center',
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('hpfm.inventoryOrg.model.inventoryOrg.externalSystemCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                  valuePropName: 'checked',
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return <span>{enableRender(val)}</span>;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 80,
        align: 'center',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <span className="action-link">
                <a onClick={() => onHandleCancelOrg(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              </span>
            );
          } else if (record._status === 'update') {
            return (
              <span className="action-link">
                <a onClick={() => onHandleOrgEdit(record, false)}>
                  {intl.get('hzero.common.status.cancel').d('取消')}
                </a>
              </span>
            );
          } else {
            return (
              <span className="action-link">
                <a onClick={() => onHandleOrgEdit(record, true)}>
                  {intl.get('hzero.common.status.edit').d('编辑')}
                </a>
              </span>
            );
          }
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          loading={fetchInventoryDataLoading}
          rowKey="organizationId"
          className={classnames(styles['db-list'])}
          dataSource={fetchInventoryData.content || []}
          columns={columns}
          pagination={pagination}
          onChange={page => onFetchInventory(page)}
        />
      </Fragment>
    );
  }
}
