/**
 * ProductEnv - 环境管理
 * @date: 2018-11-30
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Popconfirm, Select, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

const { Option } = Select;

@formatterCollections({ code: ['hsgp.productEnv'] })
@connect(({ loading, productEnv, product }) => ({
  productEnv,
  product,
  fetchLoading: loading.effects['productEnv/fetchProductEnvList'],
  fetchDetailLoading: loading.effects['productEnv/fetchProductEnvDetail'],
  createLoading: loading.effects['productEnv/createProductEnv'],
  updateLoading: loading.effects['productEnv/updateProductEnv'],
}))
export default class ProductEnv extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    const {
      dispatch,
      productEnv: { defaultProduct = '', simpleProductList = [] },
    } = this.props;
    // 如果是跳转而来的，直接请求列表数据
    if (defaultProduct || defaultProduct === 0) {
      if (simpleProductList.length === 0) {
        // 获取产品值集
        dispatch({
          type: 'productEnv/fetchSimpleProductList',
        });
      }
      this.fetchProductEnvList();
      return;
    }
    this.fetchSimpleProductList();
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      productEnv: { defaultProduct = '' },
    } = this.props;
    const {
      productEnv: { defaultProduct: next },
    } = nextProps;
    if (defaultProduct !== undefined && next !== undefined && next !== defaultProduct) {
      this.fetchProductEnvList({ productId: next });
    }
  }

  fetchSimpleProductList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productEnv/fetchSimpleProductList',
    }).then(res => {
      if (res) {
        dispatch({
          type: 'productEnv/updateState',
          payload: { defaultProduct: res[0] && res[0].productId },
        });
        this.fetchProductEnvList({ productId: res[0].productId });
      }
    });
  }

  fetchProductEnvList(params = {}) {
    const {
      dispatch,
      productEnv: { pagination = {}, defaultProduct = '' },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'productEnv/fetchProductEnvList',
      payload: { page: pagination, ...fieldsValue, productId: defaultProduct, ...params },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: flag });
  }

  /**
   * 显示编辑模态框
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  showUpdateModal(record = {}) {
    const {
      dispatch,
      productEnv: { defaultProduct, grantTypeList = [] },
    } = this.props;
    if (Array.isArray(grantTypeList) && grantTypeList.length === 0) {
      dispatch({
        type: 'productEnv/fetchValueSet',
      });
    }
    // 编辑时，获取数据
    if (record.productEnvId !== undefined) {
      dispatch({
        type: 'productEnv/fetchProductEnvDetail',
        payload: { productId: defaultProduct, productEnvId: record.productEnvId },
      });
    } else {
      dispatch({
        type: 'productEnv/updateState',
        payload: { productEnvDetail: {} },
      });
    }
    this.handleModalVisible(true, record);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchProductEnvList({ ...fieldsValue, page: {} });
  }

  /**
   * 重置查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleResetSearch(form) {
    this.setState({ fieldsValue: {} });
    form.resetFields();
  }

  /**
   * 删除
   * @param {object} record - 删除的行数据
   */
  @Bind()
  handleDeleteProductEnv(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'productEnv/deleteProductEnv',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchProductEnvList();
      }
    });
  }

  /**
   * 启用禁用
   * @param {object} record - 行数据
   * @param {boolean} flag - 启用标识
   */
  @Bind()
  handleSetEnabled(record, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: `productEnv/${flag ? 'enabledProductEnv' : 'disabledProductEnv'}`,
      payload: { ...record, enabledFlag: flag },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchProductEnvList();
      }
    });
  }

  @Bind()
  handleChangeProduct(value) {
    // 设置环境当前的产品
    const { dispatch } = this.props;
    dispatch({
      type: 'productEnv/updateState',
      payload: { defaultProduct: value },
    });
    this.fetchProductEnvList({ productId: value });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchProductEnvList({ page: pagination });
  }

  @Bind()
  handleSaveProductEnv(fieldsValue) {
    const {
      dispatch,
      productEnv: { productEnvDetail = {}, defaultProduct = '' },
    } = this.props;
    const { envCode, envName, description, orderSeq, deployPlatformId, ...other } = fieldsValue;
    const { config: detailConfig = {} } = productEnvDetail;
    const params = productEnvDetail.productEnvId
      ? {
          ...productEnvDetail,
          envCode,
          envName,
          orderSeq,
          description,
          config: { ...detailConfig, ...other },
        }
      : {
          envCode,
          envName,
          orderSeq,
          description,
          productId: defaultProduct,
          deployPlatformId,
          config: other,
          enabledFlag: 1,
        };
    dispatch({
      type: `productEnv/${
        productEnvDetail.productEnvId !== undefined ? 'updateProductEnv' : 'createProductEnv'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchProductEnvList();
      }
    });
  }

  render() {
    const {
      fetchDetailLoading = false,
      fetchLoading = false,
      createLoading = false,
      updateLoading = false,
      productEnv: {
        pagination = {},
        productEnvDetail = {},
        simpleProductList = [],
        productEnvList,
        defaultProduct,
      },
    } = this.props;
    const { modalVisible } = this.state;
    const drawerProps = {
      title: productEnvDetail.productEnvId !== undefined ? '编辑环境' : '新建环境',
      initLoading: fetchDetailLoading,
      loading: productEnvDetail.productEnvId !== undefined ? updateLoading : createLoading,
      modalVisible,
      initData: productEnvDetail,
      onCancel: this.hideModal,
      onOk: this.handleSaveProductEnv,
    };
    const columns = [
      {
        title: intl.get('hsgp.productEnv.model.productEnv.envCode').d('环境编码'),
        dataIndex: 'envCode',
      },
      {
        title: intl.get('hsgp.productEnv.model.productEnv.envName').d('环境名称'),
        dataIndex: 'envName',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.productEnv.model.productEnv.orderSeq').d('序号'),
        width: 80,
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get('hsgp.productEnv.model.productEnv.deployPlatformName').d('部署平台'),
        dataIndex: 'deployPlatformName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.showUpdateModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {record.enabledFlag === 1 ? (
                <a onClick={() => this.handleSetEnabled(record, 0)}>
                  {intl.get('hzero.common.button.disable').d('禁用')}
                </a>
              ) : (
                <a onClick={() => this.handleSetEnabled(record, 1)}>
                  {intl.get('hzero.common.button.enable').d('启用')}
                </a>
              )}
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteProductEnv(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.productEnv.view.message.title').d('环境管理')}>
          <Button type="primary" icon="plus" onClick={this.showUpdateModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <span>
            <span>{`${intl.get('hsgp.common.view.title.product').d('产品')}：`}</span>
            <Select
              style={{ width: 200 }}
              value={defaultProduct}
              onChange={this.handleChangeProduct}
            >
              {simpleProductList.map(item => {
                return (
                  <Option key={item.productId} value={item.productId}>
                    {item.productCode}
                  </Option>
                );
              })}
            </Select>
          </span>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="productEnvId"
            loading={fetchLoading}
            dataSource={productEnvList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
