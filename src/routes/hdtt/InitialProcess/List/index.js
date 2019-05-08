/**
 * InitialProcess - 数据初始化处理
 * @date: 2018-8-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';

import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@connect(({ initialProcess, loading }) => ({
  initialProcess,
  loading,
}))
@formatterCollections({ code: ['hdtt.initialProcess'] })
export default class List extends Component {
  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'initialProcess/fetchProcessStatus',
    });
  }

  /**
   * 数据查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { form } = this.search.props;
    const { dispatch } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    if (filterValues.processDate) {
      filterValues.processDate = filterValues.processDate.format(DATETIME_MIN);
    }
    dispatch({
      type: 'initialProcess/fetchInitSqlProcess',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 数据保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      initialProcess: { list, pagination },
    } = this.props;
    const params = getEditTableData(list, ['sqlProcessId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'initialProcess/savaProcess',
        payload: {
          saveData: params,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch(pagination);
        }
      });
    }
  }

  /**
   * 数据新建
   */
  @Bind()
  handleAddLine() {
    const {
      dispatch,
      initialProcess: { list, pagination },
    } = this.props;
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        list: [
          {
            sqlProcessId: uuidv4(),
            producerConfigId: '',
            producerConfigDescription: '',
            createTable: '',
            ddlSql: '',
            tempTable: '',
            importDataFlag: 1,
            processStatus: 'PENDING',
            processStatusMeaning: intl.get('hdtt.initProcess.view.message.status').d('待处理'),
            processDate: '',
            _status: 'create',
            editable: true, // 可编辑标记
          },
          ...list,
        ],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 行编辑
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleEditOption(record, flag) {
    const {
      dispatch,
      initialProcess: { list },
    } = this.props;
    const newList = list.map(item =>
      item.sqlProcessId === record.sqlProcessId ? { ...item, _status: flag ? 'update' : '' } : item
    );
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        list: [...newList],
      },
    });
  }

  /**
   * 清除新增行
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleCleanOption(record) {
    const {
      dispatch,
      initialProcess: { list, pagination },
    } = this.props;
    const newList = list.filter(item => item.sqlProcessId !== record.sqlProcessId);
    dispatch({
      type: 'initialProcess/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   *  分发处理
   * @param {object} record - 行数据对象
   */
  @Bind()
  handleDistributeOption(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hdtt/init-process/detail/${record.sqlProcessId}`,
      })
    );
  }

  /**
   *  重置查询条件(主要是租户)
   * @param {object} record - 行数据对象
   */
  // @Bind()
  // resetQueryCondition() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'initialProcess/updateState',
  //     payload: {
  //       // query: [],
  //     },
  //   });
  // }
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      initialProcess: { list, pagination, processStatus = [] },
    } = this.props;
    const filterProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      processStatus,
      onSearch: this.handleSearch,
    };
    const listProps = {
      pagination,
      processStatus,
      dataSource: list,
      loading: loading.effects['initialProcess/fetchInitSqlProcess'],
      onChange: this.handleSearch,
      onEdit: this.handleEditOption,
      onClean: this.handleCleanOption,
      onDistribute: this.handleDistributeOption,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hdtt.initProcess.view.message.title.init').d('数据初始化')}>
          <Button icon="plus" type="primary" onClick={this.handleAddLine}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" type="primary" onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="sync" onClick={() => this.handleSearch({})}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
