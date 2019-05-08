import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Checkbox, Modal, Icon, Button } from 'hzero-ui';
import moment from 'moment';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import { getDateTimeFormat, tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import { statusRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import style from './index.less';

/**
 * 数据初始化-数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Function} onEdit - 行编辑
 * @reactProps {Function} onClean - 行清除
 * @reactProps {Function} onDistribute - 分发处理
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  /**
   * state 初始化
   */
  state = {};

  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  cleanLine(record) {
    this.props.onClean(record);
  }

  /**
   * 更改行数据编辑状态
   * @param {object} record - 行数据对象
   * @param {boolean} flag - 编辑状态
   */
  changeOption(record, flag) {
    this.props.onEdit(record, flag);
  }

  /**
   * 分发操作
   * @param {object} record - 行数据对象
   */
  distributeOption(record) {
    this.props.onDistribute(record);
  }

  /**
   * DDL语句单元格onCell属性处理函数
   * @param {object} record - 行数据
   */
  onCell(record) {
    return {
      onClick: () => {
        this.setState({
          ddlSql: record.ddlSql,
          configId: record.sqlProcessId,
          ddlSqlvisible: true,
          display: !record.editable ? 'none' : 'inline-table',
        });
      },
    };
    // }
  }

  /**
   * 保存
   */
  @Bind()
  saveBtn() {
    const { form } = this.props;
    const { ddlSql, configId } = this.state;

    if (lodash.isEmpty(ddlSql)) {
      notification.warning({
        message: intl.get('hdtt.init.view.message.ddl.warning').d('DDL语句不能为空'),
      });
      return;
    }
    const obj = {};
    obj[`ddlSql#${configId}`] = ddlSql;
    form.setFieldsValue(obj);
    this.setState({ ddlSql: '', ddlSqlvisible: false });
  }

  /**
   * 取消
   */
  @Bind()
  cancelBtn() {
    this.setState({ ddlSqlvisible: false, ddlSql: '' });
  }

  /**
   * 设置DDL语句
   * @param {Object} event
   */
  @Bind()
  changeDDL(event) {
    const { value } = event.target;
    this.setState({ ddlSql: value });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const { ddlSql = '', ddlSqlvisible = false, display = 'inline-table' } = this.state;
    const columns = [
      {
        title: intl.get('hdtt.initProcess.model.initProcess.producerConfigId').d('消息生产配置'),
        dataIndex: 'producerConfigId',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`producerConfigId`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hdtt.initProcess.model.initProcess.producerConfigId')
                        .d('消息生产配置'),
                    }),
                  },
                ],
              })(<Lov code="HDTT.PRODUCER_CONFIG" textValue={record.producerConfigDescription} />)}
            </Form.Item>
          ) : (
            record.producerConfigDescription
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.createTable').d('分发表'),
        dataIndex: 'createTable',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`createTable`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hdtt.initProcess.model.initProcess.createTable').d('分发表'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val.toLowerCase()
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.ddlSql').d('DDL语句'),
        dataIndex: 'ddlSql',
        onCell: record => this.onCell(record),
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`ddlSql`, {
                initialValue: val === '' ? '' : val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hdtt.initProcess.model.initProcess.ddlSql').d('DDL语句'),
                    }),
                  },
                ],
              })(
                <Input
                  className={classNames(style['list-ellipsis'])}
                  suffix={<Icon type="edit" className={classNames(style['list-icon-edit'])} />}
                />
              )}
            </Form.Item>
          ) : (
            <div className={classNames(style['list-span'])}>{val}</div>
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.tempTable').d('临时表'),
        dataIndex: 'tempTable',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`tempTable`, {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val.toLowerCase()
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.importDataFlag').d('初始化数据'),
        dataIndex: 'importDataFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`importDataFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processDate').d('处理日期'),
        dataIndex: 'processDate',
        width: 170,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <span />
          ) : (
            val && moment(val).format(getDateTimeFormat())
          ),
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processStatus').d('处理状态'),
        dataIndex: 'processStatus',
        width: 120,
        render: (val, record) => <span>{statusRender(val, record.processStatusMeaning)}</span>,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 150,
        render: (val, record) =>
          record._status === 'create' ? (
            <a onClick={() => this.cleanLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : (
            <span className="action-link">
              <a onClick={() => this.distributeOption(record)}>
                {intl.get('hdtt.initProcess.view.option.distribute').d('分发处理')}
              </a>
              {record.processStatus === 'PENDING' &&
                (record._status === 'update' ? (
                  <a onClick={() => this.changeOption(record, false)}>
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </a>
                ) : (
                  <a onClick={() => this.changeOption(record, true)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ))}
            </span>
          ),
      },
    ];
    return (
      <Fragment>
        <EditTable
          bordered
          rowKey="sqlProcessId"
          className={classNames(style['hdtt-init-list'])}
          loading={loading}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onChange(page)}
        />
        <Modal
          title={intl.get('hdtt.init.view.message.title.ddl').d('DDL明细')}
          width={600}
          visible={ddlSqlvisible}
          onCancel={this.cancelBtn}
          footer={[
            <Button type="primary" key="save" onClick={this.saveBtn} style={{ display }}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>,
            <Button key="cancel" onClick={this.cancelBtn}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
          ]}
        >
          <Input.TextArea
            autosize={{ minRows: 5, maxRows: 10 }}
            onPressEnter={this.saveBtn}
            onChange={this.changeDDL}
            value={ddlSql}
          />
        </Modal>
      </Fragment>
    );
  }
}
