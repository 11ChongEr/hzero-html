/**
 * Orgination - 员工定义
 * @date: 2018-6-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 业务组件 - 员工定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} employee - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ employee, loading }) => ({
  employee,
  loading: loading.effects['employee/fetchEmployeeData'],
  saveLoading: loading.effects['employee/saveEmployee'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.employee', 'entity.employee'] })
export default class List extends Component {
  form;

  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      employee: { pagination = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = _back === -1 ? pagination : {};
    this.fetchEnum();
    this.handleSearchEmployee(page);
  }

  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'employee/fetchEnum',
    });
  }

  /**
   * 查询
   * @param {Object} fields 查询参数
   */
  @Bind()
  handleSearchEmployee(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'employee/fetchEmployeeData',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues, // 表单查询值
      },
    });
  }

  /**
   * 新增员工信息
   */
  @Bind()
  handleAddEmployee() {
    const {
      dispatch,
      tenantId,
      employee: { list = [], pagination = {} },
    } = this.props;
    const newItem = {
      tenantId,
      cid: '',
      employeeNum: '',
      name: '',
      email: '',
      mobile: '',
      employeeId: uuidv4(),
      gender: 0,
      enabledFlag: 1, // 启用标记
      _status: 'create', // 新建员工标记位
    };
    dispatch({
      type: 'employee/updateState',
      payload: {
        list: [newItem, ...list],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 员工信息批量保存
   * 保存对象: 新增数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      tenantId,
      employee: { list = [], pagination = {} },
    } = this.props;
    const params = getEditTableData(list, ['employeeId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'employee/saveEmployee',
        payload: {
          tenantId,
          saveData: [...params],
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearchEmployee(pagination);
        }
      });
    }
  }

  /**
   * 批量导入
   * todo
   */
  @Bind()
  handleBatchImport() {}

  /**
   * 清除新增员工信息
   * @param {Object} record 员工信息
   */
  @Bind()
  handleCleanLine(record) {
    const {
      dispatch,
      employee: { list = [], pagination = {} },
    } = this.props;
    const newList = list.filter(item => item.employeeId !== record.employeeId);
    dispatch({
      type: 'employee/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 获取员工明细，跳转明细页面
   * @param {number} employeeId - 员工Id
   * @param {number} employeeNum - 员工编码
   */
  @Bind()
  handleEditEmployee(employeeId, employeeNum) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/hr/staff/detail/${employeeId}/${employeeNum}`,
      })
    );
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
      employee: {
        list = [],
        pagination = {},
        lov: { employeeStatus = [] },
      },
    } = this.props;
    const filterProps = {
      onSearch: this.handleSearchEmployee,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: list,
      onClean: this.handleCleanLine,
      onEdit: this.handleEditEmployee,
      onSearch: this.handleSearchEmployee,
      employeeStatus,
    };
    return (
      <Fragment>
        <Header title={intl.get('hpfm.employee.view.message.title.define').d('员工定义')}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            loading={loading || saveLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddEmployee}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
