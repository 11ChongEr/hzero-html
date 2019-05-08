/**
 * DashboardClauseDetail - 条目配置新建/编辑
 * @date: 2019-03-07
 * @author: YB <bo.yang02@hand-chinacom>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { delItemsToPagination } from 'utils/utils';

import DetailForm from './DetailForm';
import DetailTable from './DetailTable';

const promptCode = 'hpfm.dashboardClause';

/**
 * 条目配置新建/编辑
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} dashboard - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ dashboardClause, loading }) => ({
  dashboardClause,
  loading:
    loading.effects['dashboardClause/fetchHead'] || loading.effects['dashboardClause/fetchTable'],
  saving: loading.effects['dashboardClause/saveClause'],
  deleting: loading.effects['dashboardClause/deleteCard'],
}))
export default class DashboardClauseDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { clauseId },
      },
    } = props;
    this.state = {
      clauseId,
      isEdit: !!clauseId,
    };
  }

  componentDidMount() {
    const {
      dashboardClause: { clauseDetailPagination = {} },
    } = this.props;
    const { clauseId } = this.state;
    this.queryValueCode();
    if (clauseId !== undefined) {
      this.handleSearchHead();
      this.handleSearchTable(clauseDetailPagination);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboardClause/updateState',
      payload: {
        clauseDetailHead: {},
        clauseDetailTableList: [],
        clauseDetailPagination: {},
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboardClause/init',
    });
  }

  /**
   * 查询卡片头
   */
  @Bind()
  handleSearchHead() {
    const { dispatch } = this.props;
    const { clauseId } = this.state;
    dispatch({
      type: 'dashboardClause/fetchHead',
      payload: clauseId,
    });
  }

  /**
   * 查询卡片头
   */
  @Bind()
  handleSearchTable(page = {}) {
    const { dispatch } = this.props;
    const { clauseId } = this.state;
    dispatch({
      type: 'dashboardClause/fetchTable',
      payload: {
        page,
        clauseId,
      },
    });
  }

  /**
   * 保存条目配置
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      history,
      dashboardClause: {
        clauseDetailHead = {},
        clauseDetailTableList = [],
        clauseDetailPagination = {},
      },
    } = this.props;
    const { isEdit } = this.state;
    const filterValues = this.form ? this.form.getFieldsValue() : {};
    const createRows = clauseDetailTableList
      .filter(o => o.isLocal)
      .map(item => {
        const { id, isLocal, ...other } = item;
        return other;
      });
    dispatch({
      type: 'dashboardClause/saveClause',
      payload: {
        ...clauseDetailHead,
        ...filterValues,
        isEdit,
        dashboardCardClauseList: createRows,
      },
    }).then(res => {
      if (res) {
        notification.success();
        if (isEdit) {
          this.handleSearchHead();
          this.handleSearchTable(clauseDetailPagination);
        } else {
          history.push(`/hpfm/dashboard-clause/detail/${res.clauseId}`);
        }
      }
    });
  }

  /**
   * 删除卡片
   * @param {Array} selectedRows 选中行
   */
  @Bind()
  handleDelete(selectedRows) {
    const {
      dispatch,
      dashboardClause: { clauseDetailTableList = [], clauseDetailPagination = {} },
    } = this.props;
    const newSelectedRows = selectedRows.map(o => o.id);
    const newDataList = clauseDetailTableList.filter(o => !newSelectedRows.includes(o.id));
    dispatch({
      type: 'dashboardClause/updateState',
      payload: {
        clauseDetailTableList: newDataList,
        clauseDetailPagination: delItemsToPagination(
          selectedRows.length,
          clauseDetailTableList.length,
          clauseDetailPagination
        ),
      },
    });

    const idList = selectedRows.filter(o => !o.isLocal);
    if (!isEmpty(idList)) {
      dispatch({
        type: 'dashboardClause/deleteCard',
        payload: idList,
      }).then(res => {
        if (res) {
          notification.success();
          if (isEmpty(newDataList)) this.handleSearchTable();
        }
      });
    }
  }

  /**
   * @param {object} ref - Form子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = ref.props.form;
  }

  render() {
    const {
      loading = false,
      saving = false,
      deleting = false,
      dashboardClause: {
        flags = [],
        clauseDetailHead = {},
        clauseDetailTableList = [],
        clauseDetailPagination = {},
      },
    } = this.props;
    const { isEdit, clauseId } = this.state;
    const formProps = {
      isEdit,
      flags,
      headInfo: clauseDetailHead,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      clauseId,
      deleting,
      dataSource: clauseDetailTableList,
      pagination: clauseDetailPagination,
      onDelete: this.handleDelete,
      onTableChange: this.handleSearchTable,
    };
    return (
      <Fragment>
        <Header
          backPath="/hpfm/dashboard-clause/list"
          title={
            isEdit
              ? intl.get(`${promptCode}.view.message.title.clauseEdit`).d('条目配置编辑')
              : intl.get(`${promptCode}.view.message.title.clauseAdd`).d('条目配置创建')
          }
        >
          <Button type="primary" icon="save" loading={saving} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={isEdit ? loading : false}>
            <div className="table-list-search">
              <DetailForm {...formProps} />
            </div>
            <DetailTable {...tableProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
