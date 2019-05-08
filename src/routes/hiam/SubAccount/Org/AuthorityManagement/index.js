/**
 * AuthorityManagement - 租户级权限维护
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Button, Row, Col, Tabs, Divider, Modal } from 'hzero-ui';
import qs from 'querystring';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import Company from './Detail/Company';
import Customer from './Detail/Customer';
import Supplier from './Detail/Supplier';
import Purorg from './Detail/Purorg';
import Puragent from './Detail/Puragent';
import Purcat from './Detail/Purcat';
import AuthorityCopy from './Detail/AuthorityCopy';
import './index.less';

const FormItem = Form.Item;
/**
 * 使用 Tabs.TabPane 组件
 */
const { TabPane } = Tabs;

/**
 * 权限复制弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} userId - 用户id
 * @reactProps {Object} copyModalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} refresh - 刷新数据
 * @reactProps {Function} authorityCopy - 控制modal显示隐藏方法
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const AuthorityCopyModal = props => {
  const { copyModalVisible, authorityCopy, userId, organizationId, refresh } = props;
  this.cancel = () => {
    authorityCopy(false);
  };
  return (
    <Modal
      title={intl.get('hiam.authorityManagement.view.button.copy').d('权限复制')}
      visible={copyModalVisible}
      onCancel={() => this.cancel()}
      width={600}
      footer={null}
    >
      <AuthorityCopy
        authorityCopy={authorityCopy}
        userId={userId}
        organizationId={organizationId}
        refresh={refresh}
      />
    </Modal>
  );
};

/**
 * 权限交换弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} changeModalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} changeAuthority - 交换后触发方法
 * @reactProps {Function} authorityChange - 控制modal显示隐藏方法
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const AuthorityChangeModal = Form.create({ fieldNameProp: null })(props => {
  const {
    changeModalVisible,
    authorityChange,
    changeAuthority,
    organizationId,
    form,
    userId,
  } = props;
  this.cancelHandle = () => {
    authorityChange(false);
  };
  this.exchanagAuthority = () => {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        changeAuthority(fieldsValue, form);
      }
    });
  };
  return (
    <Modal
      title={intl
        .get('hiam.authorityManagement.model.authorityManagement.authorityChange')
        .d('权限交换')}
      visible={changeModalVisible}
      onOk={() => this.exchanagAuthority()}
      onCancel={() => this.cancelHandle()}
      width={500}
    >
      <div>
        {intl
          .get('hiam.authorityManagement.view.message.title.authorityChange')
          .d('权限交换操作会将当前用户与所选用户权限值进行互换，请谨慎操作!')}
      </div>
      <React.Fragment>
        <FormItem>
          {form.getFieldDecorator('authorityChangeId')(
            <Lov code="HIAM.USER_AUTHORITY_USER" queryParams={{ organizationId, userId }} />
          )}
        </FormItem>
      </React.Fragment>
    </Modal>
  );
});
/**
 * 租户级权限管理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} authorityManagement，authorityCompany，authoritySupplier，authorityPurorg，authorityPurcat，authorityCustomer - 数据源
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hiam.authorityManagement', 'entity.company', 'entity.customer', 'entity.supplier'],
})
@Form.create({ fieldNameProp: null })
@connect(
  ({
    authorityCompany,
    authorityCustomer,
    authoritySupplier,
    authorityPurorg,
    authorityPurcat,
    authorityManagement,
  }) => ({
    authorityCompany,
    authorityCustomer,
    authoritySupplier,
    authorityPurorg,
    authorityPurcat,
    authorityManagement,
  })
)
@withRouter
export default class AuthorityManagement extends PureComponent {
  /**
   *Creates an instance of AuthorityManagement.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.history.location.search.substr(1));
    const organizationId = getCurrentOrganizationId();
    this.state = {
      userId: routerParam.userId,
      organizationId,
      copyModalVisible: false,
      changeModalVisible: false,
      tabList: ['customer', 'supplier', 'purorg', 'puragent', 'purcat', 'puritem', 'salitem'],
    };
  }

  /**
   *组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityManagement/fetchUserInfo',
      payload: { userId },
    });
    dispatch({
      type: 'authorityCompany/fetchAuthorityCompany',
      payload: { userId },
    });
  }

  /**
   * tab切换后查询数据
   *
   * @param {Object} name tab名称
   */
  @Bind()
  fetchData(name) {
    const { dispatch } = this.props;
    const { userId } = this.state;
    const staticData = {
      userId,
      page: 0,
      size: 10,
      authorityTypeCode: lodash.upperCase(name),
    };
    dispatch({
      type: `authority${lodash.upperFirst(name)}/fetchAuthority${lodash.upperFirst(name)}`,
      payload: staticData,
    });
  }

  /**
   *Tab改变触发事件
   *
   * @param {Object} activeKey
   */
  @Bind()
  tabChange(activeKey) {
    const { tabList } = this.state;
    const dataList = tabList;
    if (tabList.length > 0) {
      if (tabList.find(list => list === activeKey)) {
        this.setState({
          tabList: lodash.pull(dataList, activeKey),
        });
        switch (activeKey) {
          case 'customer':
            this.fetchData(activeKey);
            break;
          case 'supplier':
            this.fetchData(activeKey);
            break;
          case 'purorg':
            this.fetchData(activeKey);
            break;
          case 'puragent':
            this.fetchData(activeKey);
            break;
          case 'purcat':
            this.fetchData(activeKey);
            break;
          // 后期预留 暂时注释
          // case 'purchasing':
          //   this.fetchData('authorityPurchasing');
          //   break;
          // case 'production':
          //   this.fetchData('authorityProduction');
          //   break;
          default:
            this.setState({
              tabList: [],
            });
        }
      }
    }
  }

  /**
   *刷新数据
   *
   */
  @Bind()
  refresh() {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityCompany/fetchAuthorityCompany',
      payload: { userId },
    });
    this.setState({
      tabList: ['customer', 'supplier', 'purorg', 'puragent', 'purcat', 'puritem', 'salitem'],
    });
  }

  /**
   *权限交换modal显示隐藏标记
   *
   * @param {*Boolean} flag 隐藏/显示标记
   */
  @Bind()
  authorityChange(flag) {
    this.setState({
      changeModalVisible: !!flag,
    });
  }

  /**
   *权限复制modal显示隐藏方法
   *
   * @param {Boolean} flag 隐藏/显示标记
   */
  @Bind()
  authorityCopy(flag) {
    this.setState({
      copyModalVisible: !!flag,
    });
  }

  /**
   *权限更改触发方法
   *
   * @param {Object} values form数据
   * @param {Object} form form表单
   */
  @Bind()
  changeAuthority(values, form) {
    const { dispatch } = this.props;
    const { userId } = this.state;
    dispatch({
      type: 'authorityManagement/changeAuthority',
      payload: {
        userId,
        exchanageUserId: values.authorityChangeId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.authorityChange(false);
        this.refresh();
      }
    });
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      authorityManagement: { data = {} },
    } = this.props;
    const { organizationId, userId, copyModalVisible, changeModalVisible } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hiam.authorityManagement.view.message.title').d('权限维护')}
          backPath="/hiam/sub-account-org/users"
        >
          <Button icon="copy" type="primary" onClick={() => this.authorityCopy(true)}>
            {intl.get('hiam.authorityManagement.view.button.copy').d('权限复制')}
          </Button>
          <Button icon="swap" onClick={() => this.authorityChange(true)}>
            {intl
              .get('hiam.authorityManagement.model.authorityManagement.authorityChange')
              .d('权限交换')}
          </Button>
        </Header>
        <Content>
          <Form layout="inline">
            <Row gutter={24}>
              <Col span={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                <span>
                  {intl
                    .get('hiam.authorityManagement.model.authorityManagement.userAccount')
                    .d('账号')}
                  :
                </span>
              </Col>
              <Col span={4} style={{ borderBottom: '1px solid #ccc' }}>
                {data.loginName}
              </Col>
              <Col span={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                <span>
                  {intl
                    .get('hiam.authorityManagement.model.authorityManagement.userName')
                    .d('描述')}
                  :
                </span>
              </Col>
              <Col span={4} style={{ borderBottom: '1px solid #ccc' }}>
                {data.realName}
              </Col>
            </Row>
          </Form>
          <Divider />
          <Tabs
            defaultActiveKey="company"
            animated={false}
            onChange={this.tabChange}
            tabPosition="left"
          >
            <TabPane tab={intl.get('entity.company.tag').d('公司')} key="company">
              <Company organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane tab={intl.get('entity.customer.tag').d('客户')} key="customer">
              <Customer organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane tab={intl.get('entity.supplier.tag').d('供应商')} key="supplier">
              <Supplier organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.purorg').d('采购组织')}
              key="purorg"
            >
              <Purorg organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.puragent').d('采购员')}
              key="puragent"
            >
              <Puragent organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.purcat').d('采购品类')}
              key="purcat"
            >
              <Purcat organizationId={organizationId} userId={userId} />
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.puritem').d('采购物料')}
              key="puritem"
            >
              {/* <Customer organizationId={organizationId} userId={userId} /> */}
            </TabPane>
            <TabPane
              tab={intl.get('hiam.authorityManagement.view.message.tab.salitem').d('销售产品')}
              key="salitem"
            >
              {/* <Customer organizationId={organizationId} userId={userId} /> */}
            </TabPane>
          </Tabs>
          <AuthorityCopyModal
            organizationId={organizationId}
            copyModalVisible={copyModalVisible}
            authorityCopy={this.authorityCopy}
            userId={userId}
            refresh={this.refresh}
          />
          <AuthorityChangeModal
            changeAuthority={this.changeAuthority}
            changeModalVisible={changeModalVisible}
            authorityChange={this.authorityChange}
            userId={userId}
            organizationId={organizationId}
          />
        </Content>
      </React.Fragment>
    );
  }
}
