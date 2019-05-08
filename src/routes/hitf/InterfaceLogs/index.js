/*
 * index - 接口监控页面
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import List from './List';
import Search from './Search';

@connect(({ loading, interfaceLogs }) => ({
  fetchLogsListLoading: loading.effects['interfaceLogs/fetchLogsList'],
  interfaceLogs,
}))
@formatterCollections({ code: ['hitf.interfaceLogs'] })
export default class InterfaceLogs extends PureComponent {
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      interfaceLogs: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
  }

  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.formDom)
      ? {}
      : filterNullValueObject(this.formDom.getFieldsValue());
    const { interfaceRequestTimeStart, interfaceRequestTimeEnd } = filterValues;
    dispatch({
      type: 'interfaceLogs/fetchLogsList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        interfaceRequestTimeStart: interfaceRequestTimeStart
          ? interfaceRequestTimeStart.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        interfaceRequestTimeEnd: interfaceRequestTimeEnd
          ? interfaceRequestTimeEnd.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
      },
    });
  }

  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.handleSearch(pagination);
  }

  render() {
    const {
      interfaceLogs: { dataList = [], pagination = {} },
      history,
      fetchLogsListLoading,
    } = this.props;
    const listProps = {
      history,
      pagination,
      dataSource: dataList,
      loading: fetchLogsListLoading,
      searchPaging: this.handleStandardTableChange,
    };
    const searchProps = {
      onRef: node => {
        this.formDom = node.props.form;
      },
      onFilterChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${prompt}.view.message.title`).d('接口监控')} />
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
