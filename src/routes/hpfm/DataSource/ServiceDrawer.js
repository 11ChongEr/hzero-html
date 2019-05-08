import React from 'react';
import { Modal, Table, Popconfirm, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { createPagination } from 'utils/utils';

export default class ServiceDrawer extends React.PureComponent {
  /**
   * 分页
   *
   * @param {*} pagination
   * @memberof Drawer
   */
  @Bind()
  handleStandardTableChange(pagination) {
    const { onSearchService, datasourceId } = this.props;
    const params = {
      datasourceId,
      page: pagination.current - 1,
      size: pagination.pageSize,
    };
    onSearchService(params);
  }

  /**
   * 选择服务
   * @param {object} value
   */
  @Bind()
  handleSelectService(value) {
    const { onSelectService } = this.props;
    onSelectService(value);
  }

  /**
   * 删除服务
   * @param {object} record
   */
  @Bind()
  handleDeleteService(record) {
    const { onDeleteService } = this.props;
    onDeleteService(record);
  }

  render() {
    const { modalVisible, loading, onCancel, initLoading = false, tenantData = {} } = this.props;
    const { content = [] } = tenantData;
    const columns = [
      {
        title: intl.get('hpfm.dataSource.model.dataSource.serviceName').d('服务名称'),
        dataIndex: 'serviceName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
            onConfirm={() => {
              this.handleDeleteService(record);
            }}
          >
            <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
          </Popconfirm>
        ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title="添加服务"
        width={740}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        footer={
          <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        }
      >
        <div style={{ marginBottom: 18 }}>
          <Lov
            isButton
            type="primary"
            icon="plus"
            onOk={this.handleSelectService}
            code="HCNF.ROUTE.SERVICE_CODE"
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Lov>
        </div>
        <Table
          bordered
          columns={columns}
          dataSource={content}
          rowKey="datasourceServiceId"
          pagination={createPagination(tenantData)}
          onChange={this.handleStandardTableChange}
          loading={initLoading}
        />
      </Modal>
    );
  }
}
