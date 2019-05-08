/**
 * TenantManager - 租户管理员
 * @date: 2019-01-10
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { isEmpty, isUndefined } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@connect(({ tenantManager, loading }) => ({
  tenantManager,
  loading: loading.effects['tenantManager/fetchMembers'],
  tenantId: getCurrentOrganizationId(),
}))
export default class tenantManager extends PureComponent {
  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    const type = 'tenantManager/fetchMembers';
    dispatch({
      type,
      payload: {
        tenantId,
      },
    });
  }

  /**
   * 表单元素绑定
   * @param {*} [ref={}]
   * @memberof tenantManager
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 条件查询及表格翻页
   * @param {*} [fields={}]
   * @memberof tenantManager
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
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
      type: 'tenantManager/fetchMembers',
      payload: {
        tenantId,
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
      tenantId,
      tenantManager: { list = [], pagination = {} },
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
        <Content>
          <ExcelExport
            requestUrl={`/hpfm/v1/${tenantId}/audit-logins/export`}
            otherButtonProps={{ type: 'primary' }}
            queryParams={this.handleGetFormValue()}
          />
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
