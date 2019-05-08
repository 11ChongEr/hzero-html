/**
 * Email 邮箱
 * @date: 2018-7-25
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Table } from 'hzero-ui';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel, tableScrollWidth } from 'utils/utils';
import { enableRender } from 'utils/renderer';

import EmailForm from './EmailForm';

const FormItem = Form.Item;
@formatterCollections({ code: 'hmsg.email' })
@Form.create({ fieldNameProp: null })
@connect(({ loading, email }) => ({
  email,
  tenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
  fetchEmailLoading: loading.effects['email/fetchEmail'],
  updateEmailLoading: loading.effects['email/updateEmail'],
  createEmailLoading: loading.effects['email/createEmail'],
}))
export default class Email extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      emailFormData: {},
      modalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchEmail();
  }

  /**
   * @function fetchEmail - 获取邮箱账户列表数据
   * @param {object} params - 查询参数
   */
  fetchEmail(params = {}) {
    const {
      dispatch,
      form,
      email: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'email/fetchEmail',
      payload: { page: pagination, ...form.getFieldsValue(), ...params },
    });
  }

  /**
   * @function showModal - 新增显示模态框
   */
  @Bind()
  showModal() {
    const { dispatch } = this.props;
    this.setState({ emailFormData: {} });
    dispatch({
      type: 'email/updateState',
      payload: { emailProperties: [] },
    });
    this.handleModalVisible(true);
  }

  /**
   * @function handleModalVisible - 控制modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag });
  }

  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * @function handleSearch - 搜索邮箱账户
   */
  @Bind()
  handleSearch() {
    this.fetchEmail({ page: {} });
  }

  /**
   * @function handleResetSearch - 重置搜索表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleAddItem - 新增一条邮箱服务器配置项
   * @param {object} params - 参数
   * @param {string} params.propertyCode - 服务器配置项 - 属性名称
   * @param {string} params.propertyName - 服务器配置项 - 属性值
   */
  @Bind()
  handleAddItem(itemValue, initData) {
    const {
      dispatch,
      email: { emailProperties },
    } = this.props;
    if (initData.propertyId) {
      emailProperties.some((item, index, arr) => {
        if (initData && initData.propertyId === item.propertyId) {
          // eslint-disable-next-line
          arr[index] = {
            ...initData,
            ...itemValue,
          };
          dispatch({
            type: 'email/updateState',
            payload: {
              emailProperties: arr,
            },
          });
          return true;
        }
        return false;
      });
    } else {
      dispatch({
        type: 'email/updateState',
        payload: {
          emailProperties: [
            ...emailProperties,
            {
              isCreate: true,
              propertyId: uuid(),
              ...itemValue,
            },
          ],
        },
      });
    }
  }

  /**
   * @function handleDeleteItem - 删除一条邮箱服务器配置项
   * @param {object} record - 要删除的服务器配置项
   */
  @Bind()
  handleDeleteItem(record) {
    const {
      dispatch,
      email: { emailProperties },
    } = this.props;
    const newList = emailProperties.filter(item => item.propertyId !== record.propertyId);
    dispatch({
      type: 'email/updateState',
      payload: {
        emailProperties: newList,
      },
    });
  }

  /**
   * @function handleAdd - 新增一条邮箱服务器配置项
   * @param {object} params - 新增参数
   */
  @Bind()
  handleSaveEmail(fieldsValue) {
    const {
      dispatch,
      email: { emailProperties },
    } = this.props;
    dispatch({
      type: `email/${this.state.emailFormData.serverId ? 'updateEmail' : 'createEmail'}`,
      payload: {
        ...this.state.emailFormData,
        ...fieldsValue,
        enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
        emailProperties: emailProperties.map((item, index, arr) => {
          if (item.isCreate) {
            // eslint-disable-next-line
            delete arr[index].propertyId;
          }
          return { ...item, tenantId: fieldsValue.tenantId };
        }),
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.fetchEmail();
      }
    });
  }

  /**
   * @function handleUpdateEmail - 编辑邮箱账户行数据
   * @param {object} record - 行数据
   */
  @Bind()
  handleUpdateEmail(record) {
    const { dispatch } = this.props;
    this.setState({ emailFormData: record });
    dispatch({
      type: 'email/queryEmailServers',
      payload: { serverId: record.serverId },
    }).then(res => {
      if (res) {
        this.handleModalVisible(true);
      }
    });
  }

  /**
   * @function handlePagination - 分页操作
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchEmail({
      page: pagination,
    });
  }

  /**
   * @function renderFilterForm - 渲染搜索表单
   */
  renderFilterForm() {
    const {
      form: { getFieldDecorator },
      tenantRoleLevel,
    } = this.props;
    return (
      <Form layout="inline">
        {!tenantRoleLevel && (
          <FormItem label={intl.get('hmsg.email.model.email.tenantName').d('租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
          </FormItem>
        )}
        <FormItem label={intl.get('hmsg.email.model.email.serverCode').d('账户代码')}>
          {getFieldDecorator('serverCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hmsg.email.model.email.serverName').d('账户名称')}>
          {getFieldDecorator('serverName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      email: { emailList = [], emailProperties, pagination },
      fetchEmailLoading,
      updateEmailLoading,
      createEmailLoading,
      tenantRoleLevel,
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hmsg.email.model.email.tenantName').d('租户'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hmsg.email.model.email.serverCode').d('账户代码'),
        dataIndex: 'serverCode',
      },
      {
        title: intl.get('hmsg.email.model.email.serverName').d('账户名称'),
        dataIndex: 'serverName',
      },
      {
        title: intl.get('hmsg.email.model.email.host').d('邮件服务器'),
        width: 200,
        dataIndex: 'host',
      },
      {
        title: intl.get('hmsg.email.model.email.port').d('端口'),
        width: 100,
        dataIndex: 'port',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        render: (text, record) => {
          return (
            <a onClick={() => this.handleUpdateEmail(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.email.view.message.title').d('邮箱账户')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.status.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            rowKey="serverId"
            loading={fetchEmailLoading}
            dataSource={emailList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <EmailForm
            title={`${
              this.state.emailFormData.serverId
                ? intl.get('hmsg.email.view.message.title.modal.edit').d('编辑邮箱账户')
                : intl.get('hmsg.email.view.message.title.modal.create').d('新建邮箱账户')
            }`}
            loading={this.state.emailFormData.serverId ? updateEmailLoading : createEmailLoading}
            modalVisible={modalVisible}
            onCancel={this.hideModal}
            onOk={this.handleSaveEmail}
            initData={this.state.emailFormData}
            itemList={emailProperties}
            addItem={this.handleAddItem}
            deleteItem={this.handleDeleteItem}
            tenantRoleLevel={tenantRoleLevel}
          />
        </Content>
      </React.Fragment>
    );
  }
}
