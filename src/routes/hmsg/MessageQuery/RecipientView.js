import React from 'react';
import { Modal, Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

/**
 * 接收人数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Object} recipientData - 收件人信息
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */

export default class RecipientView extends React.PureComponent {
  // 收件人表格分页
  @Bind()
  changeTablePagination(pagination) {
    const { recordData, onOpenRecipientModal } = this.props;
    const params = {
      ...recordData,
      page: pagination.current - 1,
      size: pagination.pageSize,
    };
    onOpenRecipientModal(params);
  }

  render() {
    const { recipientVisible, onOk, recipientData, loading } = this.props;
    const columns = [
      {
        title: intl.get('hmsg.messageQuery.model.messageQuery.receiverAddress').d('收件人地址'),
        dataIndex: 'receiverAddress',
      },
    ];
    return (
      <Modal
        title={intl.get('hmsg.messageQuery.model.messageQuery.receiver').d('接收人')}
        width={520}
        destroyOnClose
        visible={recipientVisible}
        closable={false}
        footer={
          <Button type="primary" onClick={onOk}>
            {intl.get('hmsg.messageQuery.view.button.save').d('确定')}
          </Button>
        }
      >
        <Table
          bordered
          rowKey="receiverId"
          dataSource={recipientData.content || []}
          columns={columns}
          loading={loading}
          pagination={createPagination(recipientData)}
          onChange={this.changeTablePagination}
        />
      </Modal>
    );
  }
}
