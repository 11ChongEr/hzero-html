/*
 * index - 熔断设置
 * @date: 2018/09/11 10:44:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import { dateTimeRender } from 'utils/renderer.js';
import { filterNullValueObject, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

const promptCode = 'hcnf.hystrix';

/**
 * 熔断规则设置
 * @extends {PureComponent} - React.Component
 * @reactProps {object} [match={}] - react.router match路由信息
 * @reactProps {object} hystrix - 数据源
 * @reactProps {object} loading - 数据加载是否完成
 * @reactProps {object} form - 表单对象
 * return React.element
 */

@connect(({ loading, hystrix }) => ({
  fetchListLoading: loading.effects['hystrix/fetchList'],
  addLoading: loading.effects['hystrix/add'],
  refreshLoading: loading.effects['hystrix/refresh'],
  hystrix,
}))
@formatterCollections({ code: ['hcnf.hystrix'] })
export default class Hystrix extends PureComponent {
  filterForm;

  state = {
    selectedRows: [],
    modalVisible: false,
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      hystrix: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch({ page: pagination });
    } else {
      this.handleSearch();
    }
    this.fetchConfTypeCode();
  }

  /**
   * 查询平台熔断类型列表
   * @param {object} payload 查询字段
   */
  @Bind()
  handleSearch(params = {}) {
    const {
      dispatch,
      hystrix: { pagination },
    } = this.props;
    const filterValue = isUndefined(this.formDom)
      ? {}
      : filterNullValueObject(this.formDom.getFieldsValue());
    dispatch({
      type: 'hystrix/fetchList',
      payload: {
        page: pagination,
        ...filterValue,
        ...params,
      },
    });
  }

  @Bind()
  fetchConfTypeCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'hystrix/fetchConfTypeCodeList',
      payload: { lovCode: 'HSGP.HYSTRIX_CONF_TYPE' },
    });
  }

  /**
   * 新建熔断类型展示模态框
   */
  @Bind()
  showModal() {
    this.setState({ modalVisible: true });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.setState({ modalVisible: false });
    }
  }

  /**
   * 新增熔断规则
   * @param {object} fields 新增的熔断规则表单内的内容
   */
  @Bind()
  handleAdd(fields) {
    const { dispatch } = this.props;
    const refreshStatus = -1;
    const item = { refreshStatus, ...fields };
    dispatch({
      type: 'hystrix/add',
      payload: item,
    }).then(res => {
      if (res) {
        this.hideModal();
        this.handleSearch();
        notification.success();
      }
    });
  }

  /**
   * 选择规则/
   * @param {array} selectedRowKeys
   * @param {array} selectedRows
   */
  @Bind()
  handleRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 勾选刷新
   */
  @Bind()
  handleRefresh() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const confIdList = selectedRows.map(n => {
      return { confId: n.confId };
    });
    if (selectedRows.length > 0) {
      dispatch({
        type: 'hystrix/refresh',
        payload: confIdList,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
          this.setState({ selectedRows: [] });
        }
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 数据查询
   * @param {Object} pagination 查询参数
   * @param {String} [pagination.page] - 分页查询-页码
   * @param {String} [pagination.size] - 分页查询-分页大小
   */
  @Bind()
  searchPaging(pagination) {
    this.handleSearch({ page: pagination });
  }

  render() {
    const {
      history,
      fetchListLoading = false,
      addLoading = false,
      refreshLoading = false,
      hystrix: { dataSource, pagination, confTypeCodeList },
    } = this.props;
    const { selectedRows, modalVisible } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.confId),
      onChange: this.handleRowSelectedChange,
    };
    const filterProps = {
      confTypeCodeList,
      fetchListLoading,
      onRef: node => {
        this.formDom = node.props.form;
      },
      onFilterChange: this.handleSearch,
    };
    const drawerProps = {
      addLoading,
      anchor: 'right',
      confTypeCodeList,
      visible: modalVisible,
      onCancel: this.hideModal,
      onOk: this.handleAdd,
      title: intl.get(`${promptCode}.view.message.title.modal.create`).d(`新建熔断类型`),
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.hystrix.confTypeCode`).d('代码'),
        dataIndex: 'confTypeCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.confKey`).d('类型'),
        dataIndex: 'confKey',
        width: 120,
        render: (val, record) => {
          const data = confTypeCodeList.find(e => {
            return e.value === record.confKey;
          });
          if (data) {
            return data.meaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.remark`).d('描述'),
        dataIndex: 'remark',
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.serviceName`).d('服务'),
        dataIndex: 'serviceName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.serviceConfLabel`).d('服务配置标签'),
        dataIndex: 'serviceConfLabel',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.serviceConfProfile`).d('服务配置Profile'),
        dataIndex: 'serviceConfProfile',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.refreshTime`).d('刷新时间'),
        dataIndex: 'refreshTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.refreshMessage`).d('刷新消息'),
        dataIndex: 'refreshMessage',
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.refreshStatus`).d('刷新状态'),
        dataIndex: 'refreshStatus',
        width: 100,
        render: value => {
          return value === 1
            ? intl.get(`${promptCode}.model.hystrix.refreshSuccess`).d('刷新成功')
            : value === 0
            ? intl.get(`${promptCode}.model.hystrix.refreshFailed`).d('刷新失败')
            : intl.get(`${promptCode}.model.hystrix.noRefreshSuccess`).d('未刷新');
        },
      },
      {
        title: intl.get('hzero.common.status.enableFlag').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 60,
        render: (val, record) => (
          <a
            onClick={() => {
              history.push(`/hcnf/hystrix/detail/${record.confId}`);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.hystrix`).d('熔断设置')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="sync"
            onClick={this.handleRefresh}
            disabled={isEmpty(selectedRows)}
            loading={refreshLoading || fetchListLoading}
          >
            {intl.get('hzero.common.button.refresh').d('刷新配置')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowSelection={rowSelection}
            loading={fetchListLoading}
            rowKey="confId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={this.searchPaging}
            scroll={{ x: tableScrollWidth(columns) }}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
