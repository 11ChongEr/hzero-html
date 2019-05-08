import React, { PureComponent, Fragment } from 'react';
import { Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import DetailForm from './DetailForm';

/**
 * 错误日志数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  state = {
    currentProcId: null,
  };

  @Bind()
  showDetailModal(record) {
    const { dispatch, tenantId } = this.props;
    const { procId } = record;
    this.setState({ currentProcId: procId }, () => {
      dispatch({
        type: 'exception/fetchExceptionDetail',
        payload: {
          tenantId,
          procId,
        },
      }).then(() => {
        this.handleModalVisible(true);
      });
    });
  }

  @Bind()
  hideDetailModal() {
    this.handleModalVisible(false);
  }

  /**
   *是否打开模态框
   *
   * @param {*} flag true--打开 false--关闭
   * @memberof Tenants
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'exception/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      pagination = {},
      onChange,
      modalVisible,
      exceptionDetail,
    } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.common.model.process.ID').d('流程ID'),
        dataIndex: 'procId',
        width: 120,
      },
      {
        title: intl.get('hwfl.common.model.process.name').d('流程名称'),
        dataIndex: 'procDefName',
        width: 200,
      },
      {
        title: intl.get('hwfl.exception.model.exception.messageHead').d('报错原因'),
        dataIndex: 'messageHead',
        // width: 150,
      },
      {
        title: intl.get('hwfl.exception.model.exception.duedate').d('产生时间'),
        dataIndex: 'duedate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfl.exception.model.exception.messStr').d('异常信息'),
        dataIndex: 'operator',
        width: 100,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => this.showDetailModal(record)}>
              {intl.get('hwfl.common.view.message.detail').d('详情')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <DetailForm
          key={this.state.currentProcId}
          title={intl.get('hwfl.exception.model.exception.exceptionDetail').d('报错详情')}
          data={exceptionDetail}
          modalVisible={modalVisible}
          onCancel={this.hideDetailModal}
          width={900}
          footer={[
            <Button
              key={this.state.currentProcId}
              type="primary"
              style={{ float: 'left' }}
              onClick={() => this.hideDetailModal()}
            >
              {intl.get('hwfl.exception.option.callback').d('返回')}
            </Button>,
          ]}
        />
      </Fragment>
    );
  }
}
