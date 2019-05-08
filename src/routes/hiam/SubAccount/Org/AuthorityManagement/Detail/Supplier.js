/**
 * Supplier - 租户级权限维护tab页 - 供应商
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import AddDataModal from './AddDataModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 供应商
 * @extends {Component} - React.Component
 * @reactProps {Object} authoritySupplier - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ authoritySupplier, loading }) => ({
  authoritySupplier,
  addLoading: loading.effects['authoritySupplier/addAuthoritySupplier'],
  fetchLoading: loading.effects['authoritySupplier/fetchAuthoritySupplier'],
  fetchModalLoading: loading.effects['authoritySupplier/fetchModalData'],
}))
export default class Supplier extends PureComponent {
  supplierRef;

  /**
   *Creates an instance of Supplier.
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
  fetchData(pageData = {}) {
    const { form, dispatch, userId } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'SUPPLIER',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authoritySupplier/fetchAuthoritySupplier',
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
  addSupplier(addRows) {
    const {
      dispatch,
      authoritySupplier: { head = {} },
      userId,
    } = this.props;
    dispatch({
      type: 'authoritySupplier/addAuthoritySupplier',
      payload: {
        authorityTypeCode: 'SUPPLIER',
        userId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then(response => {
      if (response) {
        this.supplierRef.state.addRows = [];
        this.onHideAddModal();
        notification.success();
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
        type: 'authoritySupplier/deleteAuthoritySupplier',
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
      type: 'authoritySupplier/fetchModalData',
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
    this.supplierRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   *查询按钮点击事件
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
    const {
      dispatch,
      userId,
      authoritySupplier: { head = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authoritySupplier/addAuthoritySupplier',
      payload: {
        authorityTypeCode: 'SUPPLIER',
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
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authoritySupplier.dataName')
            .d('供应商企业名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
            .d('供应商企业代码')}
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
    this.supplierRef = ref;
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      authoritySupplier: {
        list = [],
        head = {},
        pagination = {},
        supplierDataSource = [],
        supplierPagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataName')
          .d('供应商名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
          .d('供应商代码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const addModalOptions = {
      columns,
      loading: fetchModalLoading,
      confirmLoading: addLoading,
      title: intl.get('hiam.authorityManagement.view.title.modal.supplier').d('选择供应商'),
      rowKey: 'dataId',
      queryCode: 'dataCode',
      queryName: 'dataName',
      queryCodeDesc: intl
        .get('hiam.authorityManagement.model.authoritySupplier.dataCode')
        .d('供应商代码'),
      queryNameDesc: intl
        .get('hiam.authorityManagement.model.authoritySupplier.dataName')
        .d('供应商名称'),
      dataSource: supplierDataSource,
      pagination: supplierPagination,
      modalVisible: addModalVisible,
      addData: this.addSupplier,
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
                  .get('hiam.authorityManagement.view.button.table.create.supplier')
                  .d('新建供应商权限')}
              </Button>
              <Button
                icon="minus"
                style={{ margin: '0 10px 10px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.supplier')
                  .d('删除供应商权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 10px 10px 0' }}>
            <span style={{ marginRight: '10px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.supplier')
                .d('“加入全部”即将所有供应商权限自动添加至当前账户，无需再手工添加。')}
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
        <EditTable
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
