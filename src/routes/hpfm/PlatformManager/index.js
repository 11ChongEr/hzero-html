/**
 * PlatformManager - 平台管理员
 * @date: 2019-01-10
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { Content, Header } from 'components/Page';

import ExcelExport from 'components/ExcelExport';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

@connect(({ platformManager, loading }) => ({
  platformManager,
  loading: loading.effects['platformManager/fetchMembers'],
  tenantId: getCurrentOrganizationId(),
}))
export default class PlatformManager extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const type = 'platformManager/fetchMembers';
    dispatch({ type });
  }

  /**
   * form元素绑定
   * @param {*} [ref={}]
   * @memberof PlatformManager
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 条件查询及表格翻页
   * @param {*} [fields={}]
   * @memberof PlatformManager
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        loginDateAfter:
          formValue.loginDateAfter && formValue.loginDateAfter.format(DEFAULT_DATETIME_FORMAT),
        loginDateBefore:
          formValue.loginDateBefore && formValue.loginDateBefore.format(DEFAULT_DATETIME_FORMAT),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'platformManager/fetchMembers',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterForm = this.form;
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return filterValues;
  }

  render() {
    const {
      loading,
      platformManager: { list = [], pagination = {} },
    } = this.props;
    const filterProps = {
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      loading,
      pagination,
      dataSource: list,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.login.view.message.title').d('用户登录日志')}>
          <ExcelExport
            requestUrl="/hpfm/v1/audit-logins/export"
            otherButtonProps={{ type: 'primary' }}
            queryParams={this.handleGetFormValue()}
          />
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
