/**
 * Categories - 流程分类
 * @date: 2018-8-15
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import ListTable from './ListTable';
import QueryForm from './QueryForm';
import Drawer from './Drawer';

/**
 * 流程分类数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} formValues - 查询表单值
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {!Object} fetchCategoriesLoading - 列表数据查询是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {Boolean} visible - 模态框是否可见
 * @return React.element
 */
@connect(({ categories, loading }) => ({
  categories,
  fetchCategoriesLoading: loading.effects['categories/fetchCategories'],
  saving:
    loading.effects['categories/createCategories'] || loading.effects['categories/editCategories'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.categories', 'hwfl.common'] })
export default class Categories extends PureComponent {
  form;

  state = {
    formValues: {},
    tableRecord: {},
    visible: false,
    isCreate: true,
  };

  // 初始化
  componentDidMount() {
    this.queryCategories();
  }

  // 获取所有表格列表数据
  @Bind()
  queryCategories(fields = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'categories/fetchCategories',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        organizationId,
      },
    });
  }

  // 获取表格中的记录
  @Bind()
  getRecordData(record) {
    this.setState({
      tableRecord: { ...record },
    });
    this.showEditModal();
  }

  // 保存表单中的值
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  // 关闭模态框
  @Bind()
  handleModalCancel() {
    this.setState({
      visible: false,
      isCreate: true,
      tableRecord: {},
    });
  }

  // 打开新增模态框
  @Bind()
  showModal() {
    this.setState({
      visible: true,
      isCreate: true,
    });
  }

  // 打开编辑模态框
  @Bind()
  showEditModal() {
    this.setState({
      visible: true,
      isCreate: false,
    });
  }

  // 新建流程分类
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      organizationId,
      categories: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'categories/createCategories',
      payload: { ...values, organizationId },
    }).then(response => {
      if (response) {
        this.handleModalCancel();
        this.queryCategories(pagination);
        notification.success();
      }
    });
  }

  // 编辑流程分类
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      organizationId,
      categories: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'categories/editCategories',
      payload: { ...values, organizationId },
    }).then(response => {
      if (response) {
        this.handleModalCancel();
        this.queryCategories(pagination);
        notification.success();
      }
    });
  }

  // 删除流程分类
  @Bind()
  handleDelete(values) {
    const {
      dispatch,
      organizationId,
      categories: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'categories/deleteCategories',
      payload: { ...values, organizationId },
    }).then(response => {
      if (response) {
        this.queryCategories(pagination);
        notification.success();
      }
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      categories: { categoriesData = {}, pagination = {} },
      fetchCategoriesLoading,
      saving,
    } = this.props;
    const { formValues = {}, tableRecord = {}, isCreate, visible } = this.state;
    const formProps = {
      onSearch: this.queryCategories,
      onStore: this.storeFormValues,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      categoriesData,
      formValues,
      pagination,
      loading: fetchCategoriesLoading,
      onChange: this.queryCategories,
      onGetRecord: this.getRecordData,
      onDelete: this.handleDelete,
    };
    const drawerProps = {
      tableRecord,
      visible,
      saving,
      isCreate,
      anchor: 'right',
      onCancel: this.handleModalCancel,
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.common.model.process.class').d('流程分类')}>
          <Button type="primary" icon="plus" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <ListTable {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
