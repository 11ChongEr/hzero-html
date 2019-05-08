/**
 * languages - 语言维护
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import DataList from './DataList';

/**
 * 语言控制
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} languages - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ languages, global, loading }) => ({
  languages,
  global,
  loading: loading.effects['languages/fetchLanguages'],
  saving: loading.effects['languages/editLanguage'],
}))
@formatterCollections({ code: ['entity.lang'] })
export default class Languages extends PureComponent {
  state = {};

  /**
   * 生命周期函数 获取render数据
   */
  componentDidMount() {
    this.handleSearchLanguage();
  }

  /**
   * 语言信息查询
   * @param {object} payload - 查询条件
   */
  @Bind()
  handleSearchLanguage(payload = {}) {
    const { dispatch } = this.props;
    const { form } = this.state;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'languages/fetchLanguages',
      payload: {
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: ref.props.form });
  }

  /**
   *编辑行
   * @param {object} record - 语言行对象
   * @memberof languages
   */
  @Bind()
  handleEditRow(record) {
    const {
      languages: { languageList },
      dispatch,
    } = this.props;
    const newLanguageList = languageList.map(item =>
      item.id === record.id ? { ...item, isEdit: true } : item
    );
    dispatch({
      type: 'languages/updateState',
      payload: { languageList: newLanguageList },
    });
  }

  /**
   *取消编辑行
   * @param {object} record - 语言行对象
   * @memberof languages
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      languages: { languageList },
    } = this.props;
    const newLanguageList = languageList.map(item => {
      if (item.id === record.id) {
        const { isEdit, ...others } = item;
        return { ...others };
      } else {
        return { ...item };
      }
    });
    dispatch({
      type: 'languages/updateState',
      payload: { languageList: newLanguageList },
    });
  }

  /**
   * 编辑后保存数据
   * @param {object} params 保存的参数
   */
  @Bind()
  handleSaveOption(params) {
    const {
      dispatch,
      languages: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'languages/editLanguage',
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchLanguage(pagination);
        dispatch({
          type: 'global/querySupportLanguage',
        });
      }
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
      languages: { pagination = {}, languageList = [] },
    } = this.props;

    const filterProps = {
      onSearch: this.handleSearchLanguage,
      onRef: this.handleBindRef,
    };
    const listProps = {
      loading,
      saving,
      pagination,
      dataSource: languageList,
      onEdit: this.handleEditRow,
      onCancel: this.handleCancelRow,
      onSave: this.handleSaveOption,
      onSearch: this.handleSearchLanguage,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('entity.lang.maintain').d('语言维护')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <DataList {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
