/**
 * SMSConfig - 短信配置
 * @date: 2018-8-1
 * @author: CJ <juan.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import QueryForm from './QueryForm';
import ListTable from './ListTable';
import DetailModal from './DetailModal';

/**
 * 短信账户数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} formValues - 查询表单值
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {Boolean} modalVisible - 模态框是否可见
 * @return React.element
 */
@connect(({ smsConfig, loading }) => ({
  smsConfig,
  tenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
  querySMSListLoading: loading.effects['smsConfig/fetchSMSList'],
  saving: loading.effects['smsConfig/createSMS'] || loading.effects['smsConfig/editSMS'],
}))
@withRouter
@formatterCollections({ code: ['hmsg.smsConfig'] })
export default class SMSConfig extends PureComponent {
  form;

  state = {
    modalVisible: false,
    isCreate: true,
    tableRecord: {},
  };

  componentDidMount() {
    this.fetchTableList();
    this.fetchServerTypeCode();
  }

  // 获取短信列表信息
  @Bind()
  fetchTableList(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'smsConfig/fetchSMSList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  // 获取服务类型
  fetchServerTypeCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'smsConfig/fetchServerType',
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

  // 关闭模态框
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
      isCreate: true,
      tableRecord: {},
    });
  }

  // 新建短信账户
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      smsConfig: { pagination = {} },
      tenantId,
      tenantRoleLevel,
    } = this.props;
    const params = {
      ...values,
      tenantId: tenantRoleLevel ? tenantId : values.tenantId,
    };
    dispatch({
      type: 'smsConfig/createSMS',
      payload: params,
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  // 编辑短信账户
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      smsConfig: { pagination = {} },
      tenantId,
      tenantRoleLevel,
    } = this.props;
    const editParams = {
      ...values,
      tenantId: tenantRoleLevel ? tenantId : values.tenantId,
    };
    dispatch({
      type: 'smsConfig/editSMS',
      payload: editParams,
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  // 获取编辑数据记录
  @Bind()
  getRecordData(record) {
    this.setState({
      tableRecord: { ...record },
    });
    this.showEditModal();
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
      smsConfig: { smsData = {}, serverTypeList = [], pagination = {} },
      querySMSListLoading,
      saving,
      tenantRoleLevel,
    } = this.props;
    const { modalVisible, tableRecord = {}, isCreate } = this.state;
    const formProps = {
      serverTypeList,
      tenantRoleLevel,
      onSearch: this.fetchTableList,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      pagination,
      smsData,
      tenantRoleLevel,
      loading: querySMSListLoading,
      onGetRecord: this.getRecordData,
      onChange: this.fetchTableList,
    };
    const detailProps = {
      modalVisible,
      serverTypeList,
      tableRecord,
      isCreate,
      saving,
      tenantRoleLevel,
      onCancel: this.handleCancel,
      anchor: 'right',
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.smsConfig.view.message.title').d('短信账户')}>
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
        <DetailModal {...detailProps} />
      </React.Fragment>
    );
  }
}
