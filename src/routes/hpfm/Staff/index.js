/**
 * Staff - 岗位分配员工
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 *  @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import classNames from 'classnames';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import List from './List';
import styles from './index.less';

/**
 * 员工维护组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} staff - 数据源
 * @reactProps {!boolean} addibleLoading - 可添加员工数据加载是否完成
 * @reactProps {!boolean} addedLoading - 已添加员工数据加载是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, staff }) => ({
  staff,
  addedLoading: loading.effects['staff/fetchAddedStaff'],
  addibleLoading: loading.effects['staff/fetchAddibleStaff'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.employee', 'entity.position', 'entity.employee'] })
export default class Staff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addibleRowKeys: [], // 可添加员工RowKey
      addedRowKeys: [], // 已添加员工RowKey
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render调用后获取页面数据
   */
  componentDidMount() {
    const { dispatch, tenantId, match } = this.props;
    dispatch({
      type: 'staff/fetchPositionInfo',
      payload: {
        tenantId,
        positionId: match.params.positionId,
      },
    }).then(() => {
      this.handleAddibleStaff();
      this.handleAddedStaff();
    });
  }

  /**
   * 查询岗位可添加的员工信息
   * @param {Object} fields 查询条件
   */
  @Bind()
  handleAddibleStaff(fields = {}) {
    const { dispatch, tenantId, match, staff } = this.props;
    const {
      addibleStaff: { pagination },
      unitId,
    } = staff;
    const { left } = this.state;
    const fieldValues = isUndefined(left) ? {} : left.getFieldValue('option');
    dispatch({
      type: 'staff/fetchAddibleStaff',
      payload: {
        tenantId,
        unitId,
        positionId: match.params.positionId,
        page: pagination,
        ...fieldValues,
        ...fields,
      },
    });
  }

  /**
   * 查询岗位已关联的员工信息
   * @param {Object} fields 查询条件
   */
  @Bind()
  handleAddedStaff(fields = {}) {
    const { dispatch, tenantId, match, staff } = this.props;
    const {
      addedStaff: { pagination },
      unitId,
    } = staff;
    const { right } = this.state;
    const fieldValues = isUndefined(right) ? {} : right.getFieldValue('option');
    dispatch({
      type: 'staff/fetchAddedStaff',
      payload: {
        tenantId,
        unitId,
        page: pagination,
        positionId: match.params.positionId,
        ...fieldValues,
        ...fields,
      },
    });
  }

  /**
   * 未添加员工列表，数据操作
   * @param {Array} newSelectedRowKeys
   */
  @Bind()
  handleLeftRowSelectChange(newSelectedRowKeys) {
    this.setState({ addibleRowKeys: newSelectedRowKeys });
  }

  /**
   * 已添加员工列表，数据操作
   * @param {Array} newSelectedRowKeys
   */
  @Bind()
  handleRightRowSelectChange(newSelectedRowKeys) {
    this.setState({ addedRowKeys: newSelectedRowKeys });
  }

  /**
   * 添加员工
   * @param {Array} employeeList 待添加的员工列表
   */
  @Bind()
  handleAddStaff(employeeList) {
    const { dispatch, match, staff, tenantId } = this.props;
    dispatch({
      type: 'staff/addStaff',
      payload: {
        tenantId,
        employeeList,
        unitId: staff.unitId,
        positionId: match.params.positionId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleAddibleStaff();
        this.handleAddedStaff();
        this.setState({ addedRowKeys: [], addibleRowKeys: [] });
      }
    });
  }

  /**
   * 移除员工
   * @param {Array} employeeList 待移除的员工列表
   */
  @Bind()
  handleDeleteStaff(employeeList) {
    const { dispatch, match, staff, tenantId } = this.props;
    dispatch({
      type: 'staff/deleteStaff',
      payload: {
        tenantId,
        employeeList,
        unitId: staff.unitId,
        positionId: match.params.positionId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleAddibleStaff();
        this.handleAddedStaff();
        this.setState({ addedRowKeys: [], addibleRowKeys: [] });
      }
    });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ [ref.props.locate]: (ref.props || {}).form });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { addedLoading, addibleLoading, staff } = this.props;
    const { addibleStaff, addedStaff, positionName } = staff;
    const { addedRowKeys, addibleRowKeys } = this.state;
    const leftProps = {
      locate: 'left',
      loading: addibleLoading,
      selectedRowKeys: addibleRowKeys,
      dataSource: addibleStaff.list,
      pagination: addibleStaff.pagination,
      onSearch: this.handleAddibleStaff,
      rowSelectChange: this.handleLeftRowSelectChange,
      onChange: this.handleAddibleStaff,
      onRef: this.handleBindRef,
    };
    const rightProps = {
      locate: 'right',
      loading: addedLoading,
      selectedRowKeys: addedRowKeys,
      dataSource: addedStaff.list,
      pagination: addedStaff.pagination,
      onSearch: this.handleAddedStaff,
      rowSelectChange: this.handleRightRowSelectChange,
      onChange: this.handleAddedStaff,
      onRef: this.handleBindRef,
    };
    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.employee.view.message.title.assign').d('岗位分配员工')}
          backPath={`/hpfm/hr/org/post/${staff.unitId}`}
        />
        <Content className={classNames(styles['hpfm-hr-staff'])}>
          <p className={classNames(styles['hpfm-hr-title'])}>
            <span />
            {intl
              .get('hpfm.staff.view.message.tips', {
                name: positionName,
              })
              .d(` 当前正在为「${positionName}」岗位，分配员工`)}
          </p>
          <Row gutter={16}>
            <Col span={11}>
              <List {...leftProps} />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                className={classNames(styles['btn-common'], styles['btn-add'])}
                disabled={addibleRowKeys.length === 0}
                onClick={() => {
                  this.handleAddStaff(addibleRowKeys);
                }}
              >
                {intl.get('hpfm.employee.view.option.add').d('添加')}
                <Icon type="right" />
              </Button>
              <Button
                type="primary"
                className={classNames(styles['btn-common'], styles['btn-delete'])}
                disabled={addedRowKeys.length === 0}
                onClick={() => {
                  this.handleDeleteStaff(addedRowKeys);
                }}
              >
                <Icon type="left" />
                {intl.get('hpfm.employee.view.option.remove').d('移除')}
              </Button>
            </Col>
            <Col span={11}>
              <List {...rightProps} />
            </Col>
          </Row>
        </Content>
      </Fragment>
    );
  }
}
