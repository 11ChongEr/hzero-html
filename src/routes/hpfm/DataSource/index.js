/**
 * dataSource - 数据源
 * @date: 2018-9-10
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import TableList from './TableList';
import FilterForm from './FilterForm';
import Drawer from './Drawer';
import ServiceDrawer from './ServiceDrawer';

@connect(({ dataSource, loading }) => ({
  dataSource,
  fetchListLoading: loading.effects['dataSource/fetchDataSourceList'],
  fetchTenantLoading: loading.effects['dataSource/fetchServiceList'],
  deleteServiceLoading: loading.effects['dataSource/deleteService'],
  fetchDetailLoading: loading.effects['dataSource/fetchDataSourceDetail'],
  saving:
    loading.effects['dataSource/editDataSource'] || loading.effects['dataSource/createDataSource'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.dataSource'] })
export default class DataSource extends PureComponent {
  form;

  state = {
    visible: false,
    serviceModalVisible: false, // 添加服务模态框控制
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch({});
    this.fetchBatchCode();
  }

  /**
   * 初始化值集
   */
  @Bind()
  fetchBatchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      dataSourceType: 'HPFM.DATABASE_TYPE', // 数据源类型值集
      dbPoolType: 'HPFM.DB_POOL_TYPE', // 连接池类型值集
      dsPurposeCode: 'HPFM.DATASOURCE_PURPOSE', // 数据源用途值集
    };
    // 初始化 值集
    dispatch({
      type: `dataSource/batchCode`,
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'dataSource/fetchDataSourceList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 编辑数据源
   * @param {object} record
   */
  @Bind()
  handleEditDataSource(record) {
    const { dispatch } = this.props;
    const { datasourceId, tenantId } = record;
    dispatch({
      type: 'dataSource/updateState',
      payload: { datasourceId },
    });
    dispatch({
      type: 'dataSource/fetchDataSourceDetail',
      payload: { datasourceId, tenantId },
    });
    this.setState({
      visible: true,
    });
  }

  /**
   * 关闭模态框
   *
   * @memberof FormManage
   */
  @Bind()
  handleCancelUpdate() {
    const { dispatch } = this.props;
    this.setState({
      visible: false,
    });
    dispatch({
      type: 'dataSource/updateState',
      payload: { datasourceId: undefined, tenantData: {} },
    });
  }

  /**
   * 打开新增模态框
   */
  @Bind()
  showModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataSource/updateState',
      payload: { dataSourceDetail: {}, dbPoolParams: {} },
    });
    this.setState({
      visible: true,
    });
  }

  /**
   * 显示添加服务模态框
   */
  @Bind()
  handleCreateService(record) {
    const { dispatch } = this.props;
    const { datasourceId } = record;
    this.setState({ serviceModalVisible: true });
    // 保存行datasourceId
    dispatch({
      type: 'dataSource/updateState',
      payload: { datasourceId: record.datasourceId },
    });
    this.fetchServiceList({ datasourceId });
  }

  @Bind()
  handleCancelService() {
    this.setState({ serviceModalVisible: false });
  }

  /**
   * 更新数据源
   * @param {object} values
   */
  @Bind()
  handleUpdateDataSource(values) {
    const {
      dispatch,
      tenantId,
      dataSource: { pagination, dataSourceDetail, dbPoolParams = {} },
    } = this.props;
    // 解析连接池参数
    const newOptions = {};
    Object.keys(dbPoolParams).forEach(item => {
      newOptions[item] = values[item];
    });
    let temp = { ...values };
    if (values.password === dataSourceDetail.password) {
      const { password, ...other } = values;
      temp = other;
    }
    dispatch({
      type: `dataSource/${
        dataSourceDetail.datasourceId !== undefined ? 'editDataSource' : 'createDataSource'
      }`,
      payload: { ...dataSourceDetail, ...temp, options: JSON.stringify(newOptions), tenantId },
    }).then(res => {
      if (res) {
        this.handleCancelUpdate();
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   *  删除数据源
   *
   * @param {*} values
   * @memberof FormManage
   */
  @Bind()
  handleDelete(values) {
    const {
      dispatch,
      tenantId,
      dataSource: { pagination },
    } = this.props;
    dispatch({
      type: 'dataSource/deleteDataSource',
      payload: { ...values, tenantId },
    }).then(res => {
      if (res) {
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 查询服务
   *
   * @param {object} fields - 查询参数
   */
  @Bind()
  fetchServiceList(fields = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataSource/fetchServiceList',
      payload: { ...fields },
    });
  }

  /**
   * 添加服务
   * @param {*} value
   * @memberof dataSource
   */
  @Bind()
  handleAddService(value) {
    const {
      dispatch,
      dataSource: { datasourceId },
    } = this.props;
    const { name } = value;
    dispatch({
      type: 'dataSource/addService',
      payload: { datasourceId, serviceName: name },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceList({ datasourceId });
      }
    });
  }

  /**
   * 删除服务
   *
   * @param {*} record
   * @memberof dataSource
   */
  @Bind()
  handleDeleteTenant(record) {
    const {
      dispatch,
      dataSource: { datasourceId },
    } = this.props;
    dispatch({
      type: 'dataSource/deleteService',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceList({ datasourceId });
      }
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 根据连接池类型获取连接池参数
   */
  @Bind()
  getDbPoolParams(value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataSource/getDbPoolParams',
      payload: { dbPoolType: value },
    });
  }

  /**
   * 根据数据源类型获取驱动类和连接字符串
   */
  @Bind()
  getDriverClass(value, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataSource/getDriverClass',
      payload: { dbType: value },
    }).then(res => {
      if (res) {
        const formValues = {
          driverClass: res.driverClass,
          datasourceUrl: res.datasourceUrl,
        };
        form.setFieldsValue(formValues);
      }
    });
  }

  render() {
    const {
      saving,
      tenantId,
      deleteServiceLoading = false,
      fetchListLoading = false,
      fetchTenantLoading = false,
      fetchDetailLoading = false,
      dataSource: {
        dataSourceDetail = {},
        dataSourceData = {},
        tenantData = {},
        pagination = {},
        dataSourceTypeList = [],
        dbPoolTypeList = [],
        dbPoolParams = {},
        dsPurposeCodeList = [],
      },
    } = this.props;
    const { visible, serviceModalVisible } = this.state;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    // table props
    const listProps = {
      dataSourceData,
      dataSourceTypeList,
      pagination,
      loading: fetchListLoading,
      onChange: this.handleSearch,
      onEdit: this.handleEditDataSource,
      onDelete: this.handleDelete,
      onAddService: this.handleCreateService,
    };
    const drawerProps = {
      dataSourceDetail,
      visible,
      saving,
      tenantId,
      dataSourceTypeList,
      dbPoolTypeList,
      dsPurposeCodeList,
      dbPoolParams,
      initLoading: fetchDetailLoading,
      onGetDbPoolParams: this.getDbPoolParams,
      searchTenant: this.handleSearchService,
      onCancel: this.handleCancelUpdate,
      onOk: this.handleUpdateDataSource,
      onGetDriverClass: this.getDriverClass,
    };
    const serviceProps = {
      tenantData,
      onCancel: this.handleCancelService,
      onSelectService: this.handleAddService,
      onDeleteService: this.handleDeleteTenant,
      onSearchService: this.handleSearchService,
      modalVisible: serviceModalVisible,
      initLoading: fetchTenantLoading || deleteServiceLoading,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.dataSource.view.message.title').d('数据源')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <TableList {...listProps} />
        </Content>
        <Drawer {...drawerProps} />
        <ServiceDrawer {...serviceProps} />
      </React.Fragment>
    );
  }
}
