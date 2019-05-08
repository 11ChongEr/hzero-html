/*
 * index - Zuul限流配置
 * @date: 2018/09/10 17:31:09
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, tableScrollWidth } from 'utils/utils';
import { enableRender, dateTimeRender, TagRender } from 'utils/renderer';

import ListFilter from './ListFilter';
import ListForm from './ListForm';

const messagePrompt = 'hcnf.zuulRateLimit.view.message';
const modelPrompt = 'hcnf.zuulRateLimit.model.zuulRateLimit';

/**
 * Zuul限流配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} zuulRateLimit - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, zuulRateLimit }) => ({
  loading: loading.effects['zuulRateLimit/fetchList'],
  refreshing: loading.effects['zuulRateLimit/refresh'],
  deletingHeader: loading.effects['zuulRateLimit/deleteHeaders'],
  saving: loading.effects['zuulRateLimit/addRateLimit'],
  zuulRateLimit,
}))
@formatterCollections({ code: ['hsgp.zuulRateLimit'] })
export default class ZuulRateLimit extends Component {
  zuulForm;

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearchCache();
    } else {
      this.handleSearch();
    }
  }

  /**
   * 查询限流设置列表
   * @param {obj} page 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'zuulRateLimit/fetchList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 从缓存中查询限流列表
   */
  @Bind()
  handleSearchCache() {
    const {
      zuulRateLimit: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
  }

  /**
   * 新建限流设置
   */
  @Bind()
  handleCreateHeader() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 改变当前模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'zuulRateLimit/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * 新增限流规则头
   * @param {Object} fields
   */
  @Bind()
  handleAdd(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'zuulRateLimit/addRateLimit',
      payload: fields,
    }).then(res => {
      if (!isEmpty(res)) {
        this.hideModal();
        this.handleSearchCache();
        notification.success();
      }
    });
  }

  @Bind()
  handleRefresh() {
    const that = this;
    const {
      zuulRateLimit: { selectedRowKeys, list },
      dispatch,
    } = this.props;
    if (selectedRowKeys.length > 0) {
      const zuulRateLimitDtoList = [];
      list.forEach(item => {
        if (selectedRowKeys.indexOf(item.rateLimitId) >= 0) {
          zuulRateLimitDtoList.push({
            rateLimitId: item.rateLimitId,
            serviceName: item.serviceName,
          });
        }
      });
      dispatch({
        type: 'zuulRateLimit/refresh',
        payload: zuulRateLimitDtoList,
      }).then(res => {
        if (res) {
          notification.success();
          dispatch({
            type: 'zuulRateLimit/updateState',
            payload: {
              selectedRowKeys: [],
            },
          });
          that.handleSearchCache();
        }
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'zuulRateLimit/updateState',
      payload: { selectedRowKeys: newSelectedRowKeys },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const that = this;
    const {
      zuulRateLimit: { selectedRowKeys, list },
      dispatch,
    } = this.props;
    const zuulRateLimitDtoList = [];
    list.forEach(item => {
      if (selectedRowKeys.indexOf(item.rateLimitId) >= 0) {
        zuulRateLimitDtoList.push({
          rateLimitId: item.rateLimitId,
          serviceName: item.serviceName,
        });
      }
    });
    dispatch({
      type: 'zuulRateLimit/refresh',
      payload: zuulRateLimitDtoList,
    }).then(res => {
      if (res) {
        notification.success();
        dispatch({
          type: 'zuulRateLimit/updateState',
          payload: {
            selectedRowKeys: [],
          },
        });
        that.handleSearchCache();
      }
    });
  }

  render() {
    const {
      zuulRateLimit: { list, modalVisible, pagination, selectedRowKeys },
      loading,
      saving,
      refreshing,
      history,
    } = this.props;
    const filterProps = {
      loading,
      onFilterChange: this.handleSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const columns = [
      {
        title: intl.get(`${modelPrompt}.rateLimitKey`).d('代码'),
        dataIndex: 'rateLimitKey',
      },
      {
        title: intl.get(`${modelPrompt}.rateLimitType`).d('限流方式'),
        dataIndex: 'rateLimitTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.remark`).d('说明'),
        dataIndex: 'remark',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.serviceName`).d('网关服务'),
        dataIndex: 'serviceName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.serviceConfLabel`).d('服务配置标签'),
        dataIndex: 'serviceConfLabel',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.serviceConfProfile`).d('服务配置Profile'),
        dataIndex: 'serviceConfProfile',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.refreshMessage`).d('刷新消息'),
        dataIndex: 'refreshMessage',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.refreshTime`).d('刷新时间'),
        dataIndex: 'refreshTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.refreshStatus`).d('刷新状态'),
        dataIndex: 'refreshStatus',
        width: 100,
        render: val => {
          const statusList = [
            { status: 1, color: 'green', text: '刷新成功' },
            { status: 0, color: 'red', text: '刷新失败' },
            { status: 'default', text: '未刷新' },
          ];
          return TagRender(val, statusList);
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        fixed: 'right',
        render: (val, record) => (
          <a
            onClick={() => {
              history.push(`/hcnf/zuul-limit/detail/${record.rateLimitId}`);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get(`${messagePrompt}.title`).d('限流配置')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateHeader}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="sync"
            onClick={this.handleRefresh}
            loading={refreshing}
            disabled={selectedRowKeys.length === 0}
          >
            {intl.get('hsgp.zuulRateLimit.view.button.refresh').d('刷新配置')}
          </Button>
        </Header>
        <Content>
          <ListFilter {...filterProps} />
          <Table
            bordered
            rowSelection={rowSelection}
            loading={loading}
            rowKey="rateLimitId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            dataSource={list}
            pagination={pagination}
            onChange={this.handleSearch}
          />
        </Content>
        <ListForm
          anchor="right"
          title={intl.get(`${messagePrompt}.title.listForm`).d('新增限流配置')}
          onRef={node => {
            this.zuulForm = node;
          }}
          onHandleAdd={this.handleAdd}
          confirmLoading={saving}
          visible={modalVisible}
          onCancel={this.hideModal}
        />
      </React.Fragment>
    );
  }
}
