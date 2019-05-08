import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import CountryForm from './CountryForm';
import FilterForm from './FilterForm';

@formatterCollections({ code: 'hpfm.country' })
@connect(({ loading, country }) => ({
  country,
  tenantId: getCurrentOrganizationId(),
  fetchDataLoading: loading.effects['country/fetchCountryList'],
  saving: loading.effects['country/updateCountry'],
  createLoading: loading.effects['country/createCountry'],
}))
@cacheComponent({ cacheKey: '/hpfm/country/list' })
export default class Country extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      countryFormData: {},
    };
  }

  filterForm;

  componentDidMount() {
    this.fetchCountryList();
  }

  fetchCountryList(params = {}) {
    const {
      dispatch,
      tenantId,
      country: { pagination = {} },
    } = this.props;
    const filterValue = this.filterForm === undefined ? {} : this.filterForm.getFieldsValue();
    dispatch({
      type: 'country/fetchCountryList',
      payload: { ...filterValue, page: pagination, tenantId, ...params },
    });
  }

  /**
   * 获取查询表单组件this对象
   * @param {object} ref - 查询表单组件this
   */
  @Bind()
  handleBindRef(ref) {
    this.filterForm = (ref.props || {}).form;
  }

  @Bind()
  handleSearch() {
    this.fetchCountryList({ page: {} });
  }

  @Bind()
  handleResetSearch() {
    this.filterForm.resetFields();
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'country/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  @Bind()
  showModal() {
    this.setState({
      countryFormData: {},
    });
    this.handleModalVisible(true);
  }

  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  @Bind()
  handleSaveCountry(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { countryFormData } = this.state;
    dispatch({
      type: `country/${countryFormData.countryId ? 'updateCountry' : 'createCountry'}`,
      payload: { tenantId, ...countryFormData, ...fieldsValue },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchCountryList();
      }
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchCountryList({ page: pagination });
  }

  @Bind()
  handleUpdateCountry(record) {
    this.setState({
      countryFormData: record,
    });
    this.handleModalVisible(true);
  }

  render() {
    const {
      saving,
      fetchDataLoading,
      createLoading,
      country: { countryList = [], modalVisible, pagination = {} },
    } = this.props;
    const { countryFormData = {} } = this.state;
    const columns = [
      {
        title: intl.get('hpfm.country.model.country.countryCode').d('国家代码'),
        width: 150,
        dataIndex: 'countryCode',
      },
      {
        title: intl.get('hpfm.country.model.country.countryName').d('国家名称'),
        dataIndex: 'countryName',
      },
      {
        title: intl.get('hpfm.country.model.country.quickIndex').d('快速索引'),
        dataIndex: 'quickIndex',
      },
      {
        title: intl.get('hpfm.country.model.country.abbreviation').d('简称'),
        dataIndex: 'abbreviation',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 150,
        render: (text, record) => {
          return (
            <span className="action-link">
              <Link
                to={`/hpfm/mdm/country/region/${record.countryId}/${record.countryCode}/${
                  record.countryName
                }`}
              >
                {intl.get('hpfm.country.model.country.area').d('地区定义')}
              </Link>
              <a onClick={() => this.handleUpdateCountry(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.country.view.message.title').d('国家定义')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.handleSearch}
              onReset={this.handleResetSearch}
              onRef={this.handleBindRef}
            />
          </div>
          <Table
            bordered
            rowKey="countryId"
            loading={fetchDataLoading}
            dataSource={countryList}
            columns={columns}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <CountryForm
            title={
              countryFormData.countryId !== undefined
                ? intl.get('hpfm.country.view.message.title.modal.edit').d('编辑国家')
                : intl.get('hpfm.country.view.message.title.modal.create').d('新建国家')
            }
            loading={countryFormData.countryId !== undefined ? saving : createLoading}
            modalVisible={modalVisible}
            initData={countryFormData}
            onCancel={this.hideModal}
            onOk={this.handleSaveCountry}
          />
        </Content>
      </React.Fragment>
    );
  }
}
