import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';

import styles from '../index.less';

const FormItem = Form.Item;

export default class ListTable extends PureComponent {
  /**
   * 保存当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  handleSave(record) {
    this.props.onSave(record);
  }

  /**
   * 编辑当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  editRow(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  deleteRow(record) {
    this.props.onDelete(record);
  }

  /**
   * 取消编辑当前行
   * @param {Object} record - 当前行数据
   */
  @Bind()
  cancelRow(record) {
    this.props.onCancel(record);
  }

  render() {
    const { rowKey, dataSource, loading, pagination, onSearch, tenantId } = this.props;

    const columns = [
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.ouCode').d('业务实体编码'),
        width: 150,
        align: 'left',
        dataIndex: 'ouCode',
        render: (value, record) => {
          if (record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('ouCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.operationUnit.model.operationUnit.ouCode')
                          .d('业务实体编码'),
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
                  initialValue: record.ouCode,
                })(<Input trim typeCase="upper" inputChinese={false} />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.ouName').d('业务实体名称'),
        dataIndex: 'ouName',
        render: (value, record) => {
          if (
            record.sourceCode === 'SRM' &&
            (record._status === 'create' || record._status === 'update')
          ) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('ouName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.operationUnit.model.operationUnit.ouName')
                          .d('业务实体名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: record.ouName,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        align: 'left',
        dataIndex: 'companyId',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('companyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.company.tag').d('公司'),
                      }),
                    },
                  ],
                  initialValue: record.companyId,
                })(
                  <Lov
                    code="HPFM.OPERATION_UNIT.COMPANY"
                    queryParams={{ tenantId }}
                    textValue={record.companyName}
                  />
                )}
              </FormItem>
            );
          } else {
            return record.companyName;
          }
        },
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.sourceCode').d('数据来源'),
        width: 100,
        align: 'center',
        dataIndex: 'sourceCode',
        render: (value, record) => (record._status === 'create' ? 'SRM' : value),
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.externalSystemCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
        render: (value, record) => (record._status === 'create' ? 'SRM' : value),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag ? 1 : 0,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return enableRender(value);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        render: (val, record) => (
          <span className="action-link">
            {record._status === 'update' && (
              <a onClick={() => this.cancelRow(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => this.editRow(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
            {record._status === 'create' && (
              <a onClick={() => this.deleteRow(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            )}
          </span>
        ),
      },
    ];

    return (
      <EditTable
        bordered
        className={classnames(styles['db-list'])}
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
      />
    );
  }
}
