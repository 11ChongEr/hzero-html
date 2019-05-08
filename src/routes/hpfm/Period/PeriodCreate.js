import React, { Component } from 'react';
import { Modal, Button, Form, Input, DatePicker, InputNumber } from 'hzero-ui';
import classNames from 'classnames';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import { getEditTableData } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import styles from './index.less';

/**
 * 期间维护Modal组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAddPeriod - 添加期间操作
 * @reactProps {Function} onCleanLine - 清除新增行操作
 * @reactProps {Function} onChangeFlag - 变更行编辑状态
 * @reactProps {Function} onSave - 保存操作
 * @reactProps {Function} onCancel - modal关闭
 * @reactProps {Array} dataSource - 表格数据源
 * @reactProps {Object} periodItem - 维护期间的会计期间对象
 * @return React.element
 */
export default class PeriodCreate extends Component {
  /**
   * 保存
   */
  @Bind()
  handleSavePeriod() {
    const { dataSource, onSave } = this.props;
    const params = getEditTableData(dataSource, ['periodId']);
    if (Array.isArray(params) && params.length !== 0) {
      const data = params.map(item => {
        const { dateRange, ...others } = item;
        return {
          ...others,
          startDate: dateRange && dateRange[0].format(DEFAULT_DATE_FORMAT),
          endDate: dateRange && dateRange[1].format(DEFAULT_DATE_FORMAT),
        };
      });
      onSave(data);
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      dateFormat,
      loading,
      visible,
      onCancel,
      onChangeFlag,
      onCleanLine,
      onAddPeriod,
    } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.period.model.period.periodYear').d('年'),
        dataIndex: 'periodYear',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`periodYear`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.period.model.period.periodYear').d('年'),
                    }),
                  },
                ],
              })(<InputNumber min={1} precision={0} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.period.model.period.periodName').d('期间'),
        dataIndex: 'periodName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`periodName`, {
                initialValue: val,
                rules: [
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.period.model.period.periodName').d('期间'),
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
        title: intl.get('hpfm.period.view.message.range').d('期间范围'),
        dataIndex: 'dateRange',
        align: 'center',
        width: 250,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`dateRange`, {
                initialValue:
                  record._status === 'create'
                    ? []
                    : [moment(record.startDate, dateFormat), moment(record.endDate, dateFormat)],
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.period.view.message.range').d('期间范围'),
                    }),
                  },
                ],
              })(<DatePicker.RangePicker />)}
            </Form.Item>
          ) : (
            <DatePicker.RangePicker
              defaultValue={[
                moment(record.startDate || '', dateFormat),
                moment(record.endDate || '', dateFormat),
              ]}
              disabled
            />
          ),
      },
      {
        title: intl.get('hpfm.period.model.period.periodQuarter').d('季度'),
        dataIndex: 'periodQuarter',
        align: 'center',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`periodQuarter`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.period.model.period.periodQuarter').d('季度'),
                    }),
                  },
                ],
              })(<InputNumber min={1} max={4} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
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
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <a style={{ cursor: 'pointer' }} onClick={() => onCleanLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : record._status === 'update' ? (
            <a onClick={() => onChangeFlag(record, false)} style={{ cursor: 'pointer' }}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => onChangeFlag(record, true)} style={{ cursor: 'pointer' }}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          ),
      },
    ];
    return (
      <Modal
        maskClosable={false}
        width={1000}
        onCancel={onCancel}
        visible={visible}
        footer={
          <Button type="primary" onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        }
      >
        <Header title={intl.get('hpfm.period.view.message.maintain').d('期间维护')}>
          <Button icon="save" type="primary" onClick={this.handleSavePeriod} loading={loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={onAddPeriod}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <EditTable
            bordered
            rowKey="periodId"
            className={classNames(styles['hpfm-period-list'])}
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </Content>
      </Modal>
    );
  }
}
