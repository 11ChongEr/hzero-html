/**
 * Client - 客户端
 * @date: 2018-12-24
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Table, Popconfirm, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import Drawer from './Drawer';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.client'] })
/**
 * Client - 业务组件 - 客户端
 * @extends {Component} - React.Component
 * @reactProps {!Object} [client={}] - 数据源
 * @reactProps {!Object} [loading={}] - 加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 加载是否完成
 * @reactProps {boolean} [fetchListLoading=false] - 客户端列表信息加载中
 * @reactProps {boolean} [fetchDetailLoading=false] - 详情信息加载中
 * @reactProps {boolean} [fetchRandomLoading=false] - 随机客户端信息生成中
 * @reactProps {boolean} [createLoading=false] - 新增客户端处理中
 * @reactProps {boolean} [loadingDistributeUsers=false] - 查询可分配的所有角色处理中
 * @reactProps {boolean} [fetchOwnedLoading=false] - 查询所属角色处理中
 * @reactProps {boolean} [saveRoleLoading=false] - 保存分配角色处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, client }) => ({
  client,
  fetchListLoading: loading.effects['client/fetchClientList'],
  fetchDetailLoading: loading.effects['client/fetchDetail'],
  fetchRandomLoading: loading.effects['client/fetchRandomData'],
  createLoading: loading.effects['client/createExecutable'],
  updateLoading: loading.effects['client/updateExecutable'],
  loadingDistributeUsers: loading.effects['client/roleQueryAll'], // 查询可分配的所有角色
  fetchOwnedLoading: loading.effects['client/roleCurrent'],
  saveRoleLoading: loading.effects['client/saveRoleSet'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Client extends React.Component {
  state = {
    visible: false, // 测试弹窗
    detailData: {}, // 客户端详情数据
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'client/queryType',
    });
    this.handleSearch();
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { form, dispatch, tenantId } = this.props;
    form.validateFields((err, values) => {
      const fieldValues = values || {};
      if (!err) {
        dispatch({
          type: 'client/fetchClientList',
          payload: {
            page: isEmpty(fields) ? {} : fields,
            tenantId,
            ...fieldValues,
          },
        });
      }
    });
  }

  /**
   * @function handleResetSearch - 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  // 打开连接测试弹窗
  @Bind()
  showModal() {
    this.setState({ visible: true });
  }

  // 关闭连接测试弹窗
  @Bind()
  hiddenModal() {
    this.setState({ visible: false, detailData: {} });
  }

  // 新建
  @Bind()
  handleAdd() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'client/fetchRandomData',
      payload: {
        tenantId,
      },
    }).then(res => {
      this.setState({ detailData: res }, () => {
        this.showModal();
      });
    });
  }

  // 编辑
  @Bind()
  handleUpdate(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'client/fetchDetail',
      payload: {
        tenantId,
        clientId: record.id,
      },
    }).then(res => {
      this.setState({ detailData: res }, () => {
        this.showModal();
      });
    });
  }

  // 保存
  @Bind()
  handleSave(fieldsValue) {
    const {
      dispatch,
      client: { pagination },
      tenantId,
    } = this.props;
    const { detailData } = this.state;
    const { id } = detailData;
    const { authorizedGrantTypes, scope, autoApprove } = fieldsValue;
    let grantTypes;
    let scopeT;
    let autoApproveT;
    if (authorizedGrantTypes) {
      grantTypes = authorizedGrantTypes.join(',');
    }
    if (scope) {
      scopeT = scope.join(',');
    }
    if (autoApprove) {
      autoApproveT = autoApprove.join(',');
    }
    dispatch({
      type: `client/${id ? 'updateClient' : 'createClient'}`,
      payload: {
        tenantId,
        ...detailData,
        ...fieldsValue,
        authorizedGrantTypes: grantTypes,
        scope: scopeT,
        autoApprove: autoApproveT,
        clientId: id,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.hiddenModal();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 数据列表，删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      tenantId,
      client: { pagination },
    } = this.props;
    dispatch({
      type: 'client/deleteClient',
      payload: { tenantId, ...record },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * @function renderForm - 渲染搜索表单
   */
  renderFilterForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hiam.client.model.client.name').d('名称')}>
          {getFieldDecorator('name', {})(<Input />)}
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

  // 查询所有可分配的角色
  @Bind()
  fetchAllRoles(fields) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'client/roleQueryAll',
      payload: fields,
    });
  }

  render() {
    const {
      dispatch,
      tenantId,
      client,
      createLoading,
      updateLoading,
      fetchLoading,
      loadingDistributeUsers,
      fetchOwnedLoading,
      saveRoleLoading,
    } = this.props;
    const { clientList = [], pagination, typeList = [], paginationRole } = client;
    const { visible, detailData = {} } = this.state;
    const columns = [
      {
        title: intl.get('hiam.client.model.client.name').d('名称'),
        dataIndex: 'name',
        width: 300,
      },
      {
        title: intl.get('hiam.client.model.client.authorizedGrantTypes').d('授权类型'),
        dataIndex: 'authorizedGrantTypes',
        // width: 200,
        render: text => {
          const typeListT = text.split(',') || [];
          return typeListT.map(item => {
            return <Tag key={item}>{item}</Tag>;
          });
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operation',
        width: 120,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdate(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => this.handleDeleteContent(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    const title = detailData.id
      ? intl.get('hzero.common.button.edit').d('编辑')
      : intl.get('hzero.common.button.create').d('新建');

    const drawerProps = {
      dispatch,
      tenantId,
      title,
      typeList,
      visible,
      loadingDistributeUsers,
      fetchOwnedLoading,
      saveRoleLoading,
      paginationRole,
      loading: createLoading || updateLoading,
      initData: detailData,
      onCancel: this.hiddenModal,
      onOk: this.handleSave,
      fetchAllRoles: this.fetchAllRoles,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hiam.client.view.message.title.list').d('客户端')}>
          <Button icon="plus" type="primary" onClick={this.handleAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            rowKey="id"
            loading={fetchLoading}
            dataSource={clientList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns, 400) }}
            pagination={pagination}
            onChange={this.handleSearch}
          />
          {visible && <Drawer {...drawerProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
