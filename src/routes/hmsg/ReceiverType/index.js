/**
 * ReceiverType - 接收者类型维护
 * @date: 2018-7-31
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 接收者类型维护
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} receiverType - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ receiverType, loading }) => ({
  receiverType,
  loading: loading.effects['receiverType/fetchReceiverType'],
  saveLoading:
    loading.effects['receiverType/addType'] || loading.effects['receiverType/updateType'],
}))
@formatterCollections({ code: ['hmsg.receiverType', 'entity.tenant'] })
export default class ReceiverType extends Component {
  form;

  /**
   * 初始化state
   */
  constructor(props) {
    super(props);
    this.state = {
      tableRecord: {},
      drawerVisible: false,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 新增按钮，右侧滑窗显示
   */
  @Bind()
  handleAddType() {
    this.setState({ tableRecord: {}, drawerVisible: true });
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'receiverType/fetchReceiverType',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 行内编辑，右侧滑窗显示
   * @param {object} record - 接收者类型对象
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ tableRecord: record, drawerVisible: true });
  }

  /**
   * 滑窗保存
   * @param {Object} values  - 修改后的数据
   */
  @Bind()
  handleDrawerOk(values) {
    const {
      dispatch,
      receiverType: { pagination = {} },
    } = this.props;
    let type = 'receiverType/addType'; // 默认新增
    if (values.receiverTypeId) {
      type = 'receiverType/updateType'; // 修改
    }
    dispatch({
      type,
      payload: {
        ...values,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleDrawerCancel();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 滑窗隐藏
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ tableRecord: {}, drawerVisible: false });
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
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      receiverType: { list = [], pagination = {} },
    } = this.props;
    const { tableRecord = {}, drawerVisible = false } = this.state;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: list,
      onChange: this.handleSearch,
      onEditType: this.handleEditContent,
    };
    const drawerProps = {
      tableRecord,
      saveLoading,
      visible: drawerVisible,
      anchor: 'right',
      title: intl.get('hmsg.receiverType.view.message.option').d('接收组维护'),
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.receiverType.view.message.title').d('接收组维护')}>
          <Button icon="plus" type="primary" onClick={this.handleAddType}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
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
