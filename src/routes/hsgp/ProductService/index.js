/**
 * ProductService - 服务组合
 * @date: 2018-11-29
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Popconfirm, Cascader, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({ code: ['hsgp.productService'] })
@connect(({ loading, productService }) => ({
  productService,
  fetchLoading: loading.effects['productService/fetchProductServiceList'],
  fetchDetailLoading: loading.effects['productService/fetchProductServiceDetail'],
  createLoading: loading.effects['productService/createProductService'],
}))
export default class ProductService extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      productService: { defaultProductVersion: defaultValue = [], productWithVersionList = [] },
    } = this.props;
    // 如果是跳转而来的，直接请求列表数据
    if (defaultValue[1] || defaultValue[1] === '0') {
      if (productWithVersionList.length === 0) {
        dispatch({
          type: 'productService/queryProductWithVersion',
        });
      }
      this.fetchProductServiceList();
      return;
    }
    this.queryProductWithVersion();
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      productService: { defaultProductVersion: defaultValue = [] },
    } = this.props;
    const {
      productService: { defaultProductVersion: next = [] },
    } = nextProps;
    if (next[1] !== defaultValue[1]) {
      this.fetchProductServiceList({
        productId: next[0],
        productVersionId: next[1],
      });
    }
  }

  queryProductWithVersion(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'productService/queryProductWithVersion',
      payload: params,
    }).then(res => {
      if (res) {
        const product = Array.isArray(res) ? [res[0].value, res[0].children[0].value] : [];
        dispatch({
          type: 'productService/updateState',
          payload: { defaultProductVersion: product },
        });
        this.fetchProductServiceList({
          productId: product[0],
          productVersionId: product[1],
        });
      }
    });
  }

  fetchProductServiceList(params = {}) {
    const {
      dispatch,
      productService: { pagination = {}, defaultProductVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'productService/fetchProductServiceList',
      payload: {
        page: pagination,
        productId: defaultValue[0],
        productVersionId: defaultValue[1],
        ...params,
      },
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchProductServiceList({ page: pagination });
  }

  @Bind()
  handleChangeVersion(value) {
    const { dispatch } = this.props;
    // 设置当前所用的产品和版本
    dispatch({
      type: 'productService/updateState',
      payload: { defaultProductVersion: value },
    });
    this.fetchProductServiceList({ productId: value[0], productVersionId: value[1] });
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
  showModal() {
    this.handleModalVisible(true);
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
    this.fetchProductServiceList({ ...fieldsValue, page: {} });
  }

  /**
   * 重置查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleResetSearch(form) {
    form.resetFields();
  }

  /**
   * 删除
   */
  @Bind()
  handleDeleteProductService(record = {}) {
    const {
      dispatch,
      productService: { defaultProductVersion: defaultValue = [] },
    } = this.props;
    dispatch({
      type: 'productService/deleteProductService',
      payload: { productId: defaultValue[0], productVersionId: defaultValue[1], ...record },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchProductServiceList();
      }
    });
  }

  @Bind()
  handleSaveProductService(fieldsValue) {
    const {
      dispatch,
      productService: { defaultProductVersion: defaultValue = ['', ''] },
    } = this.props;
    dispatch({
      type: 'productService/createProductService',
      payload: { productId: defaultValue[0], productVersionId: defaultValue[1], ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchProductServiceList();
      }
    });
  }

  @Bind()
  handleShowTopology() {
    const {
      history,
      productService: {
        defaultProductVersion: defaultValue = ['', ''],
        productWithVersionList = [],
      },
    } = this.props;
    // 获取产品名称
    const [product = {}] = productWithVersionList.filter(item => item.value === defaultValue[0]);
    const { meaning: productName = '', children = [] } = product;
    // 获取产品版本的名称
    const [version = {}] = children.filter(item => item.value === defaultValue[1]);
    const { meaning: versionName = '' } = version;
    history.push(
      `/hsgp/product-service/topology/${defaultValue[0]}/${
        defaultValue[1]
      }/${productName}/${versionName}`
    );
  }

  render() {
    const {
      fetchDetailLoading = false,
      fetchLoading = false,
      createLoading = false,
      productService: {
        pagination = {},
        defaultProductVersion = [],
        productWithVersionList = [],
        productServiceList = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const drawerProps = {
      title: intl.get('hsgp.productService.view.message.title.editor.create').d('新建服务'),
      modalVisible,
      loading: createLoading,
      onCancel: this.hideModal,
      onOk: this.handleSaveProductService,
    };
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
        width: 300,
        dataIndex: 'serviceCode',
      },
      {
        title: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
        dataIndex: 'serviceName',
      },
      {
        title: intl.get('hsgp.common.model.common.versionNumber').d('版本号'),
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('hsgp.common.model.common.sourceName').d('应用来源'),
        dataIndex: 'sourceName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        render: (text, record) => {
          return (
            <span className="action-link">
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteProductService(record)}
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
        <Header title={intl.get('hsgp.productService.view.message.title').d('服务组合')}>
          <Button type="primary" icon="plus" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button disabled={productServiceList.length === 0} onClick={this.handleShowTopology}>
            {intl.get('hsgp.productService.button.topology').d('拓扑图')}
          </Button>
          <span>
            <span>
              {`${intl.get('hsgp.common.view.title.product').d('产品')}/${intl
                .get('hsgp.common.view.title.version')
                .d('版本')}：`}
            </span>
            <Cascader
              placeholder=""
              style={{ width: 200 }}
              expandTrigger="hover"
              allowClear={false}
              options={productWithVersionList}
              value={defaultProductVersion}
              fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
              onChange={this.handleChangeVersion}
            />
          </span>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="productServiceId"
            initLoading={fetchDetailLoading}
            loading={fetchLoading}
            dataSource={productServiceList}
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
