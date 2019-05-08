/**
 * Calendar - 平台级日历
 * @date: 2018-9-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 日历定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} calendar - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ calendar, loading }) => ({
  calendar,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['calendar/searchCalendar'],
  saveLoading:
    loading.effects['calendar/addCalendar'] || loading.effects['calendar/updateCalendar'],
}))
@formatterCollections({ code: ['hpfm.calendar'] })
export default class List extends Component {
  form;

  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render()调用后请求数据
   */
  componentDidMount() {
    const {
      calendar: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = _back === -1 ? pagination : {};
    this.handleSearchCalendar(page);
  }

  /**
   * 新增日历信息
   */
  @Bind()
  handleAddOption() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 编辑日历头信息
   * @param {object} record - 日历对象
   */
  @Bind()
  handleCalendarRow(record) {
    this.setState({ drawerVisible: true, targetItem: record });
  }

  /**
   * 跳转日历详情维护页面
   * @param {object} record - 日历对象
   */
  @Bind()
  handleCalendarDetail(record) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: `/hpfm/mdm/calendar/detail/${record.calendarId}` }));
  }

  /**
   * Drawer Close
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * Drawer Ok
   * @param {obejct} values - 操作数据对象
   */
  @Bind()
  handleDrawerOk(values) {
    const {
      dispatch,
      calendar: { pagination = {} },
      tenantId,
    } = this.props;
    dispatch({
      type: isUndefined(values.calendarId) ? 'calendar/addCalendar' : 'calendar/updateCalendar',
      payload: { tenantId, ...values },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchCalendar(pagination);
        this.setState({ targetItem: {}, drawerVisible: false });
      }
    });
  }

  /**
   * 查询日历数据
   * @param {Object} fields - 查询参数
   */
  @Bind()
  handleSearchCalendar(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'calendar/searchCalendar',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 设置form对象
   * @param {object} ref - FilterForm子组件引用
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
      calendar: { calendarList = [], pagination = {} },
    } = this.props;
    const { drawerVisible = false, targetItem = {} } = this.state;
    const filterProps = {
      onSearch: this.handleSearchCalendar,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: calendarList,
      onSearch: this.handleSearchCalendar,
      onEditDetail: this.handleCalendarDetail,
      onEditRow: this.handleCalendarRow,
    };
    const drawerProps = {
      loading: saveLoading || loading,
      targetItem,
      title: intl.get('hpfm.calendar.view.message.drawer').d('信息编辑'),
      anchor: 'right',
      visible: drawerVisible,
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.calendar.view.message.title.define').d('日历定义')}>
          <Button icon="plus" type="primary" onClick={this.handleAddOption}>
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
