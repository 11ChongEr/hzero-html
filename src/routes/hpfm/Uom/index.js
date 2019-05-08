/**
 * Uom - 计量单位定义
 * @date: 2018-7-6
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind, Debounce } from 'lodash-decorators';
import { DEBOUNCE_TIME } from 'utils/constants';
import { isUndefined, isEmpty } from 'lodash';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 计量单位定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} uom - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ uom, loading }) => ({
  uom,
  loading: loading.effects['uom/fetchUomData'],
  saveLoading: loading.effects['uom/saveUomData'],
}))
@formatterCollections({ code: ['hpfm.uom'] })
export default class Uom extends Component {
  form;

  /**
   * state初始化
   * @param {object} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * componentDidMount
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 新增
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleAddUom() {
    const {
      dispatch,
      uom: { list = [], pagination = {} },
    } = this.props;
    dispatch({
      type: 'uom/updateState',
      payload: {
        list: [
          {
            uomId: uuidv4(),
            uomCode: '',
            uomName: '',
            tenantId: 0,
            uomTypeCode: '',
            uomTypeName: '',
            enabledFlag: 1,
            _status: 'create', // 新建标记位
          },
          ...list,
        ],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveUom() {
    const {
      dispatch,
      uom: { list = [], pagination = {} },
    } = this.props;
    const params = getEditTableData(list, ['uomId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'uom/saveUomData',
        payload: params,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch(pagination);
        }
      });
    }
  }

  /**
   * 数据查询
   * @param {Object} fields 查询参数
   * @param {Object} fields.page- 分页参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'uom/fetchUomData',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 编辑
   * @param {Object} record 计量单位
   * @param {Boolean} flag  编辑/取消标记
   */
  @Bind()
  handleEditLine(record, flag) {
    const {
      dispatch,
      uom: { list = [] },
    } = this.props;
    const newList = list.map(item =>
      item.uomId === record.uomId ? { ...item, _status: flag ? 'update' : '' } : item
    );
    dispatch({
      type: 'uom/updateState',
      payload: {
        list: [...newList],
      },
    });
  }

  /**
   * 清除新增行数据
   * @param {Objec} record 待清除的数据对象
   */
  @Bind()
  handleCleanLine(record) {
    const {
      dispatch,
      uom: { list = [], pagination = {} },
    } = this.props;
    const newList = list.filter(item => item.uomId !== record.uomId);
    dispatch({
      type: 'uom/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
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
      uom: { pagination = {}, list = [] },
    } = this.props;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: list,
      onCleanLine: this.handleCleanLine,
      onEditLine: this.handleEditLine,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.uom.view.message.title').d('计量单位定义')}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSaveUom}
            loading={saveLoading || loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddUom}>
            {intl.get('hzero.common.button.create').d('新建')}
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
