/**
 * 灰度节点新建弹窗
 * @date: 2018-10-9
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Table, Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading, nodeGrayGroup }) => ({
  fetchData: loading.effects['nodeGrayGroup/fetchNewestNodeGroup'],
  confirm: loading.effects['nodeGrayGroup/saveNodeGroups'],
  nodeGrayGroup,
}))
export default class NodeGroupDrawer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination) {
    const { fetchNewestNodeGroup } = this.props;
    fetchNewestNodeGroup({
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  }

  /**
   * 保存数据
   * @function handleSaveData
   */
  @Bind()
  handleSaveData() {
    const {
      onOk,
      dispatch,
      nodeGrayGroup: {
        envData: { envId },
        currentGrayGroup: { grayGroupId },
      },
      handleModalVisible,
    } = this.props;
    const { selectedRowKeys } = this.state;
    // 保存为当前灰度范围选择的节点组数据
    if (selectedRowKeys.length !== 0) {
      dispatch({
        type: 'nodeGrayGroup/saveNodeGroups',
        payload: {
          selectedRowKeys,
          grayGroupId,
          envId,
        },
      }).then(res => {
        if (res) {
          this.setState({ selectedRowKeys: [] });
          onOk();
        }
      });
    } else {
      // 未选择，则直接关闭
      handleModalVisible(false);
    }
  }

  /**
   * 关闭Modal
   * @function handleCancel
   */
  @Bind()
  handleCancel() {
    const { handleModalVisible } = this.props;
    this.setState({ selectedRowKeys: [] });
    handleModalVisible(false);
  }

  /**
   * 根据应用节点组名称查询应用节点组
   * @function handleSerach
   */
  @Bind()
  handleSerach() {
    const { form, fetchNewestNodeGroup } = this.props;
    const nodeGroupName = form.getFieldValue('nodeGroupName');
    fetchNewestNodeGroup({ nodeGroupName }); // 获取当前可新增的节点组
  }

  /**
   * @function resetSearch - 重置搜索表单
   */
  @Bind()
  resetSearch() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * @function onChange - tabel改变时,存储选中项的key
   * @param {array} selectedRowKeys - 选中项key值数组
   */
  @Bind()
  onChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      form,
      modalVisible,
      nodeGrayGroup: { NewestNodeGroupList },
      fetchData,
      confirm,
      tablePagination,
    } = this.props;
    const { getFieldDecorator } = form;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onChange,
    };
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const columns = [
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.nodeGroupName').d('应用节点组名称'),
        dataIndex: 'nodeGroupName',
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.appName').d('服务'),
        dataIndex: 'appName',
        width: 150,
      },
      {
        title: intl.get('hsgp.nodeGrayGroup.model.nodeGrayGroup.appVersionName').d('应用版本'),
        dataIndex: 'appVersionName',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get('hsgp.nodeGrayGroup.view.message.createNodeGroup').d('新增节点组')}
        onCancel={this.handleCancel}
        onOk={this.handleSaveData}
        visible={modalVisible}
        confirmLoading={confirm}
      >
        <Form layout="inline">
          <FormItem
            label={intl
              .get('hsgp.nodeGrayGroup.model.nodeGrayGroup.nodeGroupName')
              .d('应用节点组名称')}
            {...formLayout}
          >
            {getFieldDecorator('nodeGroupName')(<Input />)}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" onClick={this.handleSerach}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
          <FormItem>
            <Button onClick={this.resetSearch}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
        <Table
          bordered
          rowKey="nodeGroupId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={NewestNodeGroupList.content || []}
          pagination={tablePagination}
          rowSelection={rowSelection}
          loading={fetchData}
          onChange={this.handleStandardTableChange}
        />
      </Modal>
    );
  }
}
