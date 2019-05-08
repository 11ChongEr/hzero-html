/**
 * DeployHistory - 流程发布记录
 * @date: 2018-8-16
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';

import DeployDetail from './DeployDetail';

@connect(({ processDefine, loading }) => ({
  processDefine,
  loading: loading.effects['processDefine/fetchDeployHistory'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: 'hwfl.processDefine' })
@Form.create({ fieldNameProp: null })
export default class DeployHistory extends Component {
  /**
   * state初始化
   */
  state = {
    target: { id: '' },
  };

  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processDefine/fetchCategory',
      payload: { tenantId },
    });
    this.handleSearch();
  }

  /**
   * 数据查询
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, match, tenantId } = this.props;
    dispatch({
      type: 'processDefine/fetchDeployHistory',
      payload: {
        tenantId,
        key: match.params.id,
        page: isEmpty(fields) ? {} : fields,
      },
    });
  }

  /**
   * 查看部署详情，显示滑窗
   * @param {object} - 部署记录对象
   */
  detailOption(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processDefine/fetchDeployDetail',
      payload: {
        tenantId,
        deploymentId: record.deploymentId,
      },
    }).then(res => {
      if (res) {
        this.setState({ deploy: res });
      }
    });
    this.setState({ drawerVisible: true, target: record });
  }

  /**
   * 删除部署记录
   * @param {object} record - 部署记录对象
   */
  deleteOption(record) {
    const {
      dispatch,
      tenantId,
      processDefine: {
        deployHistory: { pagination },
      },
    } = this.props;
    dispatch({
      type: 'processDefine/deleteDeploy',
      payload: {
        tenantId,
        deploymentId: record.deploymentId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 关闭部署详情滑窗
   */
  @Bind()
  handleCloseDrawer() {
    this.setState({ drawerVisible: false, target: {} });
  }

  @Bind()
  handleChangePanel(key) {
    const { dispatch, tenantId } = this.props;
    const { target } = this.state;
    let type = '';
    switch (key) {
      case 'deploy':
        type = 'processDefine/fetchDeployDetail';
        break;
      case 'image':
        type = 'processDefine/fetchProcessImage';
        break;
      default:
        type = 'processDefine/fetchProcessDetail';
    }
    if (!isUndefined(key)) {
      // 面板切换时才dispatch，展开收起不需要dispatch
      dispatch({
        type,
        payload: {
          tenantId,
          deploymentId: target.deploymentId,
          processId: target.id,
        },
      }).then(res => {
        if (res) {
          this.setState({
            [key]: res,
          });
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      processDefine: { deployHistory = {}, category = [] },
      tenantId,
    } = this.props;
    const {
      drawerVisible = false,
      deploy = {},
      process = {},
      image = {},
      target: { id },
    } = this.state;
    const detailDrawer = {
      deploy,
      process,
      image,
      category,
      tenantId,
      id,
      title: intl.get('hwfl.processDefine.view.message.datail').d('流程部署详情'),
      visible: drawerVisible,
      anchor: 'right',
      onCancel: this.handleCloseDrawer,
      onChangePanel: this.handleChangePanel,
    };
    const columns = [
      {
        title: intl.get('hwfl.processDefine.model.process.id').d('ID'),
        dataIndex: 'id',
        width: 250,
      },
      {
        title: intl.get('hwfl.common.model.process.name').d('流程名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.processDefine.model.process.flag').d('标识'),
        dataIndex: 'key',
        width: 250,
      },
      {
        title: intl.get('hwfl.processDefine.model.process.category').d('分类'),
        dataIndex: 'category',
        width: 250,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.detailOption(record)}>
              {intl.get('hwfl.common.view.message.detail').d('详情')}
            </a>
            <a onClick={() => this.deleteOption(record)}>
              {intl.get('hzero.common.button.delete').d('移除')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Fragment>
        <Header
          title={intl.get('hwfl.processDefine.view.message.deploy').d('流程发布查看')}
          backPath="/hwfl/setting/process-define/list"
        >
          {/* <Button icon="sync" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
        <Content>
          <Table
            bordered
            rowKey="id"
            loading={loading}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={deployHistory.data}
            pagination={deployHistory.pagination}
            onChange={this.handleSearch}
          />
          <DeployDetail {...detailDrawer} />
        </Content>
      </Fragment>
    );
  }
}
