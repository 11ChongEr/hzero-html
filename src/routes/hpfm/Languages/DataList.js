import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Input, Icon } from 'hzero-ui';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './index.less';

/**
 * 库位信息展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Function} onDelete -  新增行删除
 * @reactProps {Function} onEditRow - 编辑行
 * @reactProps {Function} onCancel - 编辑行取消
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  /**
   * 保存
   * @param {*} record 行数据
   */
  @Bind()
  handleSave(record) {
    const { form, onSave } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { isEdit, ...others } = record;
        const params = { ...others, ...values };
        onSave(params);
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      loading,
      dataSource,
      pagination,
      onSearch,
      saving,
      onCancel,
      onEdit,
    } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get('entity.lang.code').d('语言编码'),
        width: 200,
        dataIndex: 'code',
        render: (text, record) =>
          record.isEdit ? (
            <Form.Item>
              {getFieldDecorator(`code`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.lang.code').d('语言编码'),
                    }),
                  },
                ],
                initialValue: record.code,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: intl.get('entity.lang.name').d('语言名称'),
        dataIndex: 'name',
        render: (text, record) =>
          record.isEdit ? (
            <Form.Item>
              {getFieldDecorator(`name`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.lang.name').d('语言名称'),
                    }),
                  },
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                ],
                initialValue: record.name,
              })(<Input />)}
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: intl.get('entity.lang.description').d('语言描述'),
        dataIndex: 'description',
        render: (text, record) =>
          record.isEdit ? (
            <Form.Item>
              {getFieldDecorator(`description`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.lang.description').d('语言描述'),
                    }),
                  },
                  {
                    max: 42,
                    message: intl.get('hzero.common.validation.max', {
                      max: 42,
                    }),
                  },
                ],
                initialValue: record.description,
              })(<Input />)}
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 100,
        render: (text, record) => (
          <React.Fragment>
            {record.isEdit && (
              <span className="action-link">
                {saving ? (
                  <Icon type="loading" />
                ) : (
                  <a onClick={() => this.handleSave(record)}>
                    {intl.get('hzero.common.button.save').d('保存')}
                  </a>
                )}
                <a style={{ marginLeft: 5 }} onClick={() => onCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              </span>
            )}
            {!record.isEdit && (
              <a onClick={() => onEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
            )}
          </React.Fragment>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="id"
          className={classNames(styles['db-list'])}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onSearch}
        />
        {/* <Table
            bordered
            rowKey="id"
            loading={loading}
            className={classnames(styles['db-list'])}
            dataSource={languageList}
            columns={columns}
            pagination={createPagination(languageData)}
            onChange={this.handleTableChange}
          /> */}
      </Fragment>
    );
  }
}
