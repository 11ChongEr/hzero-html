/**
 * Customer - 租户级权限维护tab页 - 客户
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import AddDataModal from './AddDataModal';
/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 客户
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityCustomer - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ authorityCustomer, loading }) => ({
  authorityCustomer,
  addLoading: loading.effects['authorityCustomer/addAuthorityCustomer'],
  fetchLoading: loading.effects['authorityCustomer/fetchAuthorityCustomer'],
  fetchModalLoading: loading.effects['authorityCustomer/fetchModalData'],
}))
export default class Customer extends PureComponent {
  customerRef;

  /**
   *Creates an instance of Customer.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
      addModalVisible: false,
    };
  }

  /**
   *查询数据
   *
   * @param {Object} pageData
   */
  @Bind()
  fetchData(pageData) {
    const { form, dispatch, userId } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'CUSTOMER',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityCustomer/fetchAuthorityCustomer',
          payload: {
            ...fieldsValue,
            ...staticData,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addCompany(addRows) {
    const {
      dispatch,
      authorityCustomer: { head = {} },
      userId,
    } = this.props;
    dispatch({
      type: 'authorityCustomer/addAuthorityCustomer',
      payload: {
        authorityTypeCode: 'CUSTOMER',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then(response => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.customerRef.state.addRows = [];
        this.refresh();
      }
    });
  }

  /**
   *删除方法
   */
  @Bind()
  remove() {
    const { dispatch, userId } = this.props;
    const { selectRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'authorityCustomer/deleteAuthorityCustomer',
        payload: {
          userId,
          deleteRows: selectRows,
        },
      }).then(response => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   *刷新
   */
  @Bind()
  refresh() {
    this.fetchData();
    this.setState({
      selectRows: [],
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectRows: selectedRows });
  }

  /**
   * 查询弹出框数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const { dispatch, userId } = this.props;
    dispatch({
      type: 'authorityCustomer/fetchModalData',
      payload: {
        userId,
        ...queryData,
      },
    });
  }

  /**
   * 展示弹出框
   */
  @Bind()
  onShowAddModal() {
    this.fetchModalData();
    this.setState({
      addModalVisible: true,
    });
  }

  /**
   * 隐藏弹出框
   */
  @Bind()
  onHideAddModal() {
    this.customerRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   *点击查询按钮事件
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    this.setState({
      switchLoading: true,
    });
    const {
      dispatch,
      userId,
      authorityCustomer: { head = {} },
    } = this.props;
    dispatch({
      type: 'authorityCustomer/addAuthorityCustomer',
      payload: {
        authorityTypeCode: 'CUSTOMER',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then(response => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *渲染查询结构
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityCustomer.dataName')
            .d('客户企业名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityCustomer.dataCode')
            .d('客户企业代码')}
        >
          {getFieldDecorator('dataCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.customerRef = ref;
  }

  render() {
    const {
      authorityCustomer: {
        list = [],
        head = {},
        pagination,
        customerDataSource = [],
        customerPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.dataName')
          .d('客户企业名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.dataCode')
          .d('客户企业代码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      confirmLoading: addLoading,
      loading: fetchModalLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.customer').d('选择客户'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authorityCustomer.dataCode')
        .d('客户企业代码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authorityCustomer.dataName')
        .d('客户企业名称'),
      dataSource: customerDataSource,
      pagination: customerPagination,
      modalVisible: addModalVisible,
      addData: this.addCompany,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map(n => n.authorityLineId),
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div>
          {!head.includeAllFlag && (
            <React.Fragment>
              <Button
                icon="plus"
                style={{ margin: '0 10px 10px 0' }}
                onClick={() => this.onShowAddModal()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.create.customer')
                  .d('新建客户权限')}
              </Button>
              <Button
                icon="minus"
                style={{ margin: '0 10px 10px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.customer')
                  .d('删除客户权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 10px 10px 0' }}>
            <span style={{ marginRight: '10px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.customer')
                .d('“加入全部”即将所有客户权限自动添加至当前账户，无需再手工添加。')}
              placement="right"
            >
              <Switch
                loading={switchLoading}
                checked={!!head.includeAllFlag}
                onChange={this.includeAllFlag}
              />
            </Tooltip>
          </div>
        </div>
        <Table
          bordered
          rowKey="authorityLineId"
          loading={fetchLoading}
          dataSource={list}
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
      </div>
    );
  }
}
