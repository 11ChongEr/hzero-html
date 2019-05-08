/**
 * ProcessDefine - 流程设置/流程定义
 * @date: 2018-8-16
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { filter, isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 流程定义组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} processDefine - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 新建是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.processDefine', 'hwfl.common'] })
@connect(({ processDefine, loading }) => ({
  processDefine,
  loading: loading.effects['processDefine/fetchProcessList'],
  saving: loading.effects['processDefine/createProcess'],
  tenantId: getCurrentOrganizationId(),
}))
export default class ProcessDefine extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    processList: [],
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      processDefine: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.fetchCategory();
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 获取流程分类
  @Bind()
  fetchCategory() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processDefine/fetchCategory',
      payload: { tenantId },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'processDefine/fetchProcessList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 数据新增
   */
  @Bind()
  handleAddContent() {
    this.setState({ drawerVisible: true });
  }

  /**
   * 流程删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteModel(record) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    dispatch({
      type: 'processDefine/deleteProcess',
      payload: {
        tenantId,
        modelId: record.id,
        record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 部署记录查看
   * @param {object} record - 流程对象
   */
  @Bind()
  handleDeployModel(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hwfl/setting/process-define/deploy/${record.key}`,
      })
    );
  }

  /**
   * 流程发布
   * @param {object} record - 流程对象
   */
  @Bind()
  handleReleaseModel(record) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    const { processList = [] } = this.state;
    this.setState({ processList: [...processList, record.id] });
    dispatch({
      type: 'processDefine/releaseProcess',
      payload: {
        tenantId,
        modelId: record.id,
      },
    }).then(res => {
      // 成功与否都更新processList
      this.setState({ processList: filter(this.state.processList, item => item !== record.id) });
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 滑窗保存操作
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveContent(values) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    dispatch({
      type: 'processDefine/createProcess',
      payload: {
        tenantId,
        process: { ...values, tenantId },
      },
    }).then(res => {
      if (res) {
        this.setState({ drawerVisible: false });
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 滑窗取消操作
   */
  @Bind()
  handleCancelOption() {
    this.setState({ drawerVisible: false });
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  handleCheckUnique(values) {
    const { dispatch, tenantId } = this.props;
    return dispatch({
      type: 'processDefine/checkUnique',
      payload: {
        tenantId,
        values,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saving,
      processDefine: { category = [], list = [], pagination = {} },
    } = this.props;
    const { drawerVisible = false, processList = [] } = this.state;
    const filterProps = {
      category,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      category,
      pagination,
      processList, // 流程Id数组
      dataSource: list,
      processing: {
        list: loading,
      },
      onEdit: this.handleEditModel,
      onDelete: this.handleDeleteModel,
      onDeploy: this.handleDeployModel,
      onRelease: this.handleReleaseModel,
      onChange: this.handleSearch,
    };
    const drawerProps = {
      category,
      saving,
      anchor: 'right',
      title: intl.get('hwfl.processDefine.view.option.add').d('添加流程'),
      visible: drawerVisible,
      onOk: this.handleSaveContent,
      onCancel: this.handleCancelOption,
      onCheck: this.handleCheckUnique,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.common.model.process.define').d('流程定义')}>
          <Button icon="plus" type="primary" onClick={this.handleAddContent}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
