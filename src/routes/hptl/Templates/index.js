/**
 * portalTemplate - 模板维护
 * @date: 2018-8-13
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import QueryForm from './QueryForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 门户模板定义数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} formValues - 查询表单值
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {Boolean} modalVisible - 模态框是否可见
 * @return React.element
 */
@connect(({ portalTemplate, loading }) => ({
  portalTemplate,
  loading: loading.effects['portalTemplate/fetchTemplates'],
  saving:
    loading.effects['portalTemplate/createTemplate'] ||
    loading.effects['portalTemplate/editTemplate'],
}))
@withRouter
@formatterCollections({ code: ['hptl.portalTemplate'] })
@withRouter
export default class Templates extends PureComponent {
  form;

  state = {
    formValues: {},
    tableRecord: {},
    fileList: [], // 编辑时模板缩略图
    modalVisible: false,
    isCreate: true,
  };

  // 初始化
  componentDidMount() {
    this.fetchTableList();
  }

  // 获取表格数据
  @Bind()
  fetchTableList(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'portalTemplate/fetchTemplates',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  // 保存表单中的值
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  // 获取表格中的记录
  @Bind()
  getRecordData(record = {}) {
    this.setState({
      tableRecord: { ...record },
      fileList: [
        {
          uid: '-1',
          name: record.imageName,
          status: 'done',
          url: record.templateAvatar,
        },
      ],
    });
    this.showEditModal();
  }

  // 关闭模态框
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
      isCreate: true,
      tableRecord: {},
      fileList: [],
    });
  }

  // 打开新增模态框
  @Bind()
  showModal() {
    this.setState({
      modalVisible: true,
      isCreate: true,
    });
  }

  // 打开编辑模态框
  @Bind()
  showEditModal() {
    this.setState({
      modalVisible: true,
      isCreate: false,
    });
  }

  // 新建模板维护
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      portalTemplate: { pagination },
    } = this.props;
    dispatch({
      type: 'portalTemplate/createTemplate',
      payload: values,
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  // 编辑模板维护
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      portalTemplate: { pagination },
    } = this.props;
    dispatch({
      type: 'portalTemplate/editTemplate',
      payload: values,
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
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
    const { modalVisible, formValues, tableRecord, isCreate, fileList = [] } = this.state;
    const {
      saving,
      loading,
      portalTemplate: { templateData, pagination },
    } = this.props;
    const formProps = {
      onSearch: this.fetchTableList,
      onStore: this.storeFormValues,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      templateData,
      formValues,
      loading,
      pagination,
      onChange: this.fetchTableList,
      onGetRecord: this.getRecordData,
    };
    const drawerProps = {
      tableRecord,
      modalVisible,
      saving,
      isCreate,
      fileList,
      anchor: 'right',
      onCancel: this.handleCancel,
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.portalTemplate.view.message.title').d('模板维护')}>
          <Button type="primary" onClick={this.showModal} icon="plus">
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
