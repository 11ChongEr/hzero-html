import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({ code: 'hpfm.country' })
@connect(({ loading, region }) => ({
  region,
  tenantId: getCurrentOrganizationId(),
  createLoading: loading.effects['region/createRegion'],
  updateLoading: loading.effects['region/updateRegion'],
  initLoading: loading.effects['region/fetchRegionData'],
}))
export default class Region extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandedList: [],
    };
  }

  componentDidMount() {
    this.fetchDataList();
  }

  fetchDataList(params = {}) {
    const { dispatch, match, tenantId } = this.props;
    const {
      params: { id: countryId },
    } = match;
    return dispatch({
      type: 'region/fetchRegionData',
      payload: { tenantId, countryId, ...params },
    });
  }

  /**
   * 搜索地区定义，返回对应地区的树形结构数据
   * @param {object} values - 搜索条件
   */
  @Bind()
  handleSearch(form) {
    const exList = [];
    const exTreeKey = list => {
      if (list) {
        for (let i = 0; i < list.length; i++) {
          exList.push(list[i].regionId);
          if (list[i].children) {
            exTreeKey(list[i].children);
          }
        }
      }
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.fetchDataList(fieldsValue).then(res => {
          if (Array.isArray(res) && res.length > 0 && fieldsValue.condition) {
            exTreeKey(res);
            this.setState({
              expandedList: exList,
            });
          } else {
            this.setState({
              expandedList: [],
            });
          }
        });
      }
    });
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
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'region/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * 显示模态框
   * @param {object} record - 行数据
   */
  showModal(record) {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'region/updateState',
      payload: {
        regionDetail: {
          ...record,
          regionCode: '',
          regionName: '',
          region_name: record.regionName || '',
          isCreate: true,
          countryId: match.params.id,
        },
      },
    });
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
   * 保存地区更新
   * @param {object} fieldsValue - 更新的数据
   */
  @Bind()
  handleSaveRegion(fieldsValue) {
    const {
      dispatch,
      match,
      tenantId,
      region: { regionDetail },
    } = this.props;
    // 编辑地区 or 新增下级
    const params = regionDetail.regionId
      ? {
          ...regionDetail,
          countryId: match.params.id,
          countryCode: match.params.code,
          enabledFlag: 1,
          ...fieldsValue,
        }
      : {
          parentRegionId: regionDetail.parentRegionId,
          countryCode: regionDetail.countryCode,
          countryId: regionDetail.countryId,
          enabledFlag: regionDetail.enabledFlag,
          ...fieldsValue,
        };
    dispatch({
      type: `region/${regionDetail.regionId ? 'updateRegion' : 'createRegion'}`,
      payload: { tenantId, ...params },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchDataList();
      }
    });
  }

  /**
   * 设置地区启用
   * @param {object} record - 行数据
   * @param {*} flag - 标识
   */
  @Bind()
  handleSetDisabled(record, flag) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'region/setDisabledRegion',
      payload: {
        tenantId,
        ...record,
        regionId: record.regionId,
        objectVersionNumber: record.objectVersionNumber,
        enabledFlag: flag,
      },
    }).then(res => {
      if (res) {
        this.fetchDataList();
        notification.success();
      }
    });
  }

  /**
   * 更新地区，打开模态框
   * @param {object} record - 行数据
   */
  @Bind()
  handleUpdateRegion(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'region/updateState',
      payload: {
        regionDetail: record,
      },
    });
    this.handleModalVisible(true);
  }

  render() {
    const {
      region: { regionList = [], modalVisible, regionDetail = {} },
      createLoading,
      updateLoading,
      initLoading,
      match,
    } = this.props;
    const modalTitle = regionDetail.regionId
      ? intl.get('hpfm.region.view.message.title.modal.edit').d('编辑地区')
      : `${
          regionDetail.region_name
            ? `${regionDetail.region_name}${intl
                .get('hpfm.region.view.message.title.modal.cteate')
                .d('新建地区')}`
            : intl.get('hpfm.region.view.message.title.modal.cteate').d('新建地区')
        }`;
    const columns = [
      {
        title: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
        dataIndex: 'regionCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
        dataIndex: 'regionName',
      },
      {
        title: intl.get('hpfm.region.model.region.quickIndex').d('快速索引'),
        dataIndex: 'quickIndex',
      },
      {
        title: intl.get('hpfm.region.model.region.enabledFlag').d('启用'),
        width: 100,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'isDisable',
        width: 200,
        render: (text, record) => {
          return (
            <span className="action-link">
              {record.enabledFlag === 1 ? (
                <React.Fragment>
                  <a
                    onClick={() => {
                      const { _token, regionId, ...other } = record;
                      this.showModal({ ...other, parentRegionId: regionId });
                    }}
                  >
                    {intl.get('hzero.region.button.add').d('新建下级地区')}
                  </a>
                  <a onClick={() => this.handleSetDisabled(record, 0)}>
                    {intl.get('hzero.common.button.disable').d('禁用')}
                  </a>
                  <a onClick={() => this.handleUpdateRegion(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                </React.Fragment>
              ) : (
                <a onClick={() => this.handleSetDisabled(record, 1)}>
                  {intl.get('hzero.common.button.enable').d('启用')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.region.view.message.title').d('地区定义')}
          backPath="/hpfm/mdm/country/list"
        >
          <Button
            icon="plus"
            type="primary"
            onClick={this.showModal.bind(this, { enabledFlag: 1 })}
          >
            {intl.get('hzero.region.button.create').d('新建根节点')}
          </Button>
        </Header>
        <Content
          description={
            <React.Fragment>
              <span style={{ marginRight: '8px' }}>
                {intl.get('hpfm.region.model.region.countryCode').d('国家代码')}：
                {match.params.code}
              </span>
              <span>
                {intl.get('hpfm.region.model.region.countryName').d('国家名称')}：
                {match.params.name}
              </span>
            </React.Fragment>
          }
        >
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="regionId"
            loading={initLoading}
            dataSource={regionList}
            columns={columns}
            pagination={false}
            expandedRowKeys={this.state.expandedList}
            uncontrolled
          />
          <Drawer
            title={modalTitle}
            modalVisible={modalVisible}
            loading={regionDetail.regionId ? updateLoading : createLoading}
            initData={regionDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveRegion}
          />
        </Content>
      </React.Fragment>
    );
  }
}
