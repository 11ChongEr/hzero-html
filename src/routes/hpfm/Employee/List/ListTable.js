import React, { PureComponent, Fragment } from 'react';
import { Input, Form, Select } from 'hzero-ui';
import classNames from 'classnames';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import { enableRender } from 'utils/renderer';
import { EMAIL, PHONE } from 'utils/regExp';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * 员工定义-数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onClean - 清除新增员工行
 * @reactProps {Function} onEdit - 编辑员工信息
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onSearch,
      onClean,
      onEdit,
      employeeStatus = [],
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.employee.code').d('员工编码'),
        dataIndex: 'employeeNum',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`employeeNum`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.code').d('员工编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.employee.name').d('员工姓名'),
        dataIndex: 'name',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`name`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.name').d('员工姓名'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.quickIndex').d('快速索引'),
        dataIndex: 'quickIndex',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`quickIndex`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.quickIndex').d('快速索引'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.phoneticize').d('拼音'),
        dataIndex: 'phoneticize',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`phoneticize`, {
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`email`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.cellphone').d('手机号'),
        dataIndex: 'mobile',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`mobile`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.cellphone').d('手机号'),
                    }),
                  },
                  {
                    pattern: PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.status').d('员工状态'),
        dataIndex: 'status',
        width: 150,
        align: 'center',
        render: (val, record) => {
          return record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`status`, {
                initialValue: val,
              })(
                <Select className={styles['full-width']} allowClear>
                  {employeeStatus.map(item => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.statusMeaning
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 120,
        align: 'center',
        fixed: 'right',
        render: (val, record) =>
          record._status === 'create' ? (
            <a onClick={() => onClean(record)}>{intl.get('hzero.common.button.clean').d('清除')}</a>
          ) : (
            <a onClick={() => onEdit(record.employeeId, record.employeeNum)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          scroll={{ x: tableScrollWidth(columns, 200) }}
          rowKey="employeeId"
          loading={loading}
          className={classNames(styles['hpfm-hr-list'])}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
      </Fragment>
    );
  }
}
