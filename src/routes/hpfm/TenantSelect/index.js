import React, { PureComponent } from 'react';
import { Modal, Icon, Table, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { getSession, setSession, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { cleanMenuTabs } from 'utils/menuTab';
import style from './index.less';

/**
 * 使用Tabs.TabPane组件
 */
const { TabPane } = Tabs;

@formatterCollections({ code: 'hpfm.tenantSelect' })
@connect(({ user }) => ({
  user,
}))

/**
 * 租户切换 Tenant
 *
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {!boolean} [modalVisible=false] - 是否显示选择租户的模态框
 * @reactProps {!string} [selectTenant=''] - 用户选择的租户名称
 * @reactProps {!array} [historyTenantList=[]] - 缓存用户选择的租户数据
 * @reactProps {!array} [tenantList=[]] - 租户列表数据
 * @reactProps {!number} [organizationId] - 当前登录用户的租户ID
 * @reactProps {!string} [tenantName] - 当前登录用户的租户名称
 * @returns React.element
 */
export default class Tenant extends PureComponent {
  /**
   * constructor - constructor方法
   * 组件构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tenantId: getCurrentOrganizationId(),
      selectTenant: getSession('currentTenant').tenantName || '',
      historyTenantList: getSession('historyTenantList') || [],
    };
  }

  /**
   * @function showModal - 显示和隐藏租户切换模态框
   * @param {boolean} flag - 显示或隐藏标识
   */
  @Bind()
  showModal(flag) {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'user/fetchTenantList',
      });
    }
    this.setState({ modalVisible: flag });
  }

  /**
   * @function handleSelectTenant - 选择租户
   * @param {object} record - 选择的租户行数据
   * @param {string} record.tenantId - 租户ID
   * @param {string} record.tenantName - 租户名称
   * @param {string} record.tenantNum - 租户编码
   */
  @Bind()
  handleSelectTenant(record) {
    const { dispatch } = this.props;
    const { historyTenantList } = this.state;
    let isHave = false;
    this.setState({
      modalVisible: false,
      selectTenant: record.tenantName,
    });
    // 处理用户选择租户数据，避免添加重复数据
    if (historyTenantList.length > 0) {
      historyTenantList.some(item => {
        if (item.tenantId === record.tenantId) {
          isHave = true;
          return true;
        }
        return false;
      });
      if (!isHave) {
        historyTenantList.push(record);
      }
    } else {
      historyTenantList.push(record);
    }
    // 设置当前租户ID缓存
    const saveTenant = setSession('currentTenant', record);
    // 重新设置租户历史数据缓存
    const isSave = setSession('historyTenantList', historyTenantList);
    if (isSave && saveTenant) {
      // 设置sessionStorage成功后更新租户状态数据
      this.setState({
        historyTenantList: getSession('historyTenantList'),
        selectTenant: getSession('currentTenant').tenantName,
      });
      // warn 清空 tabs 信息
      cleanMenuTabs();
      // 切换租户成功后跳转首页，刷新页面
      dispatch(routerRedux.push({ pathname: '/' }));
      // 缓存当前用户的租户
      dispatch({
        type: 'user/updateCurrentTenant',
        payload: { tenantId: record.tenantId },
      }).then(res => {
        if (res) {
          dispatch(routerRedux.push({ pathname: '/workplace' }));
          window.location.reload();
        }
      });
    }
  }

  render() {
    const { user } = this.props;
    const {
      tenantList,
      currentUser: { tenantName },
    } = user;
    const { tenantId } = this.state;
    const columns = [
      {
        title: intl.get('hpfm.tenantSelect.model.tenantSelect.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
        render: (text, record) => {
          return (
            <div className={style.tenant}>
              {record.tenantId === tenantId && <div className={style['tenant-select-wrapper']} />}
              <a onClick={() => this.handleSelectTenant(record)}>
                {text}
                {record.tenantId === tenantId &&
                  `(${intl.get('hpfm.tenantSelect.view.message.me').d('当前')})`}
              </a>
            </div>
          );
        },
      },
      {
        title: intl.get('hpfm.tenantSelect.model.tenantSelect.tenantNum').d('租户编码'),
        width: 100,
        align: 'center',
        dataIndex: 'tenantNum',
      },
    ];
    return (
      <React.Fragment>
        <React.Fragment>
          {this.state.selectTenant ? (
            <React.Fragment>
              <span
                style={{
                  width: '100%',
                  display: 'inline-block',
                  marginRight: '12px',
                  backgroundColor: 'rgba(255, 255, 255,.1)',
                }}
                size="small"
                onClick={() => this.showModal(true)}
              >
                <Icon type="home" />
                {this.state.selectTenant}
              </span>
            </React.Fragment>
          ) : tenantName ? (
            <span
              style={{
                width: '100%',
                display: 'inline-block',
                marginRight: '12px',
                backgroundColor: 'rgba(255, 255, 255,.1)',
              }}
              size="small"
              onClick={() => this.showModal(true)}
            >
              <Icon type="home" />
              {tenantName}
            </span>
          ) : (
            ''
          )}
        </React.Fragment>
        <Modal
          title={intl.get('hpfm.tenantSelect.view.message.title').d('选择租户')}
          width="620px"
          bodyStyle={{ paddingTop: 0, height: '460px' }}
          visible={this.state.modalVisible}
          onCancel={() => this.showModal(false)}
          footer={null}
        >
          <Tabs defaultActiveKey="all" animated={false}>
            <TabPane tab={intl.get('hpfm.tenantSelect.view.message.modal.all').d('全部')} key="all">
              <Table
                rowKey="tenantId"
                bordered
                dataSource={tenantList}
                columns={columns}
                scroll={this.scroll}
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={intl.get('hpfm.tenantSelect.view.message.modal.history').d('最近')}
              key="history"
            >
              <Table
                rowKey="tenantId"
                bordered
                dataSource={this.state.historyTenantList}
                columns={columns}
                scroll={this.scroll}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        </Modal>
      </React.Fragment>
    );
  }

  scroll = {
    y: 360,
  };
}
