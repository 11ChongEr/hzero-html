/**
 * LovSetting - 值集视图配置窗口
 * @date: 2018-6-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Input, Button, Modal, Tag } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';

import SearchPage from 'components/SearchPage';
import { Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import { enableRender } from 'utils/renderer';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import PreviewModal from './PreviewModal';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * lov弹框编辑
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleAdd - 数据保存
 * @reactProps {Function} showCreateModal - 控制modal显示隐藏方法
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })(props => {
  const { form, modalVisible, handleAdd, showCreateModal, confirmLoading } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd({ ...fieldsValue, viewCode: lodash.trim(fieldsValue.viewCode) }, form);
    });
  };
  return (
    <Modal
      title={intl.get('hpfm.lov.view.message.title.modal.lovSetting').d('新建值集视图')}
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      width={600}
      onCancel={() => showCreateModal(false, form)}
    >
      <React.Fragment>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.lov.model.lov.viewCode').d('视图代码')}
        >
          {form.getFieldDecorator('viewCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.lov.model.lov.viewCode').d('视图代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.lov.model.lov.viewName').d('视图名称')}
        >
          {form.getFieldDecorator('viewName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.lov.model.lov.viewName').d('视图名称'),
                }),
              },
              {
                max: 80,
                message: intl.get('hzero.common.validation.max', {
                  max: 80,
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.lov.model.lov.valueField').d('值字段名')}
        >
          {form.getFieldDecorator('valueField', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.lov.model.lov.valueField').d('值字段名'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.lov.model.lov.displayField').d('显示字段名')}
        >
          {form.getFieldDecorator('displayField', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.lov.model.lov.displayField').d('显示字段名'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label={intl.get('hpfm.lov.model.lov.lovId').d('值集')}
        >
          {form.getFieldDecorator('lovId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.lov.model.lov.lovId').d('值集'),
                }),
              },
            ],
          })(
            <Lov code={isTenantRoleLevel() ? 'HPFM.LOV.LOV_DETAIL.ORG' : 'HPFM.LOV.LOV_DETAIL'} />
          )}
        </FormItem>
        {!isTenantRoleLevel() && (
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get('entity.tenant.name').d('租户名称')}
          >
            {form.getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" textField="tenantName" />)}
          </FormItem>
        )}
      </React.Fragment>
    </Modal>
  );
});

/**
 * lov定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} lovSetting - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hpfm.lov', 'entity.tenant'],
})
@connect(({ lovSetting, loading }) => ({
  lovSetting,
  isTenantRoleLevel: isTenantRoleLevel(),
  currentTenantId: getCurrentOrganizationId(),
  list: lovSetting.data,
  loading: loading.effects['lovSetting/fetchLovList'],
  confirmLoading: loading.effects['lovSetting/addLovValue'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
@cacheComponent({ cacheKey: '/hpfm/lov-view/lov-view-list' })
export default class LovSetting extends SearchPage {
  /**
   * 内部状态
   */
  state = {
    formValues: {},
    modalVisible: false,
    tenantStatus: {
      display: 'none',
      required: false,
    },
    previeVisible: false,
    viewCode: '',
  };

  createForm; // 侧边栏内部引用

  /**
   * 跳转维护页面
   * @param {Object} record 编辑时候传入的当前行值
   */
  @Bind()
  showEditModal(record) {
    const { history } = this.props;
    history.push(`/hpfm/lov-view/detail/${record.viewHeaderId}`);
  }

  /**
   * 新增
   * @param {Object} fieldsValue 传递的filedvalue
   */
  @Bind()
  handleAdd(fieldsValue, form) {
    const { dispatch, history } = this.props;
    const defaultData = {
      delayLoadFlag: 0,
      enabledFlag: 1,
    };
    const data = {
      ...fieldsValue,
      ...defaultData,
      pageSize: 10,
    };
    dispatch({
      type: 'lovSetting/addLovValue',
      payload: data,
    }).then(response => {
      if (response) {
        this.setState({
          modalVisible: false,
        });
        form.resetFields();
        notification.success();
        history.push(`/hpfm/lov-view/detail/${response.viewHeaderId}`);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const { dispatch } = this.props;
    const data = {
      page: 0,
      size: 10,
    };
    dispatch({
      type: 'lovSetting/fetchLovList',
      payload: data,
    }).then(() => {
      this.setState({
        selectedRows: [],
      });
      this.handleFormReset();
    });
  }

  /**
   * 删除
   */
  @Bind()
  deleteValue() {
    const { dispatch } = this.props;
    let deleteArr = [];
    const onOk = () => {
      const datas = this.state.selectedRows;
      if (datas) {
        for (let i = 0; i < datas.length; i++) {
          const data = {
            viewHeaderId: datas[i].viewHeaderId,
            objectVersionNumber: datas[i].objectVersionNumber,
          };
          deleteArr.push(data);
        }
      } else {
        deleteArr = [];
      }
      dispatch({
        type: 'lovSetting/deleteLovValue',
        payload: deleteArr,
      }).then(response => {
        if (response) {
          this.refreshValue();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 控制modal弹出层的展示和隐藏
   * @param {boolean} flag 显示/隐藏标记
   */
  @Bind()
  showCreateModal(flag, form) {
    this.setState({
      modalVisible: !!flag,
    });
    if (!flag) {
      form.resetFields();
    }
  }

  /**
   * 预览
   * @param {Object} record 行数据
   */
  @Bind()
  showLovComponent(flag, record) {
    if (flag === false && this.createForm) {
      this.createForm.resetForm();
    }
    this.setState({
      previeVisible: flag,
    });
    if (record) {
      this.setState({
        viewCode: record.viewCode,
      });
    }
    if (!flag) {
      this.setState({
        viewCode: '',
      });
    }
  }

  @Bind()
  pageConfig() {
    return {
      modelName: 'lovSetting',
      cacheKey: '/hpfm/lov-view/lov-view-list',
      searchDispatch: 'lovSetting/fetchLovList',
      searchCallback: this.searchCallback,
    };
  }

  /**
   * 搜索回调
   */
  @Bind()
  searchCallback() {
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 查询方法
   */
  dispatchTypeMap = {
    query: 'lovSetting/fetchLovList',
  };

  /**
   * 渲染查询form
   * @returns
   */
  renderForm(form) {
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <FormItem label={intl.get('hpfm.lov.model.lov.viewCode').d('视图代码')}>
          {getFieldDecorator('viewCode')(<Input trim typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.lov.model.lov.viewName').d('视图名称')}>
          {getFieldDecorator('viewName')(<Input />)}
        </FormItem>
        {!isTenantRoleLevel() && (
          <FormItem label={intl.get('entity.tenant.name').d('租户名称')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
          </FormItem>
        )}
      </React.Fragment>
    );
  }

  /**
   * 其他结构渲染
   * @returns
   */
  renderOther() {
    const { modalVisible, tenantStatus, previeVisible, viewCode } = this.state;
    const { confirmLoading } = this.props;
    const parentMethods = {
      handleAdd: this.handleAdd,
      showCreateModal: this.showCreateModal,
    };
    return (
      <div>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
          tenantStatus={tenantStatus}
          confirmLoading={confirmLoading}
          onRef={ref => {
            this.createForm = ref;
          }}
        />
        <PreviewModal
          viewCode={viewCode}
          showLovComponent={this.showLovComponent}
          previeVisible={previeVisible}
        />
      </div>
    );
  }

  /**
   * 渲染头部
   * @returns
   */
  renderHeader() {
    const { selectedRows = [] } = this.state;
    return (
      <Header title={intl.get('hpfm.lov.view.message.title.lovSetting').d('值集视图配置')}>
        <Button icon="plus" type="primary" onClick={() => this.showCreateModal(true)}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {selectedRows.length > 0 && (
          <Button icon="minus" onClick={this.deleteValue}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        )}
      </Header>
    );
  }

  /**
   * 表格属性
   * @returns
   */
  tableProps() {
    const { loading, currentTenantId } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.lov.model.lov.viewCode').d('视图代码'),
        dataIndex: 'viewCode',
        align: 'left',
        width: 300,
      },
      {
        title: intl.get('hpfm.lov.model.lov.viewName').d('视图名称'),
        dataIndex: 'viewName',
      },
      !isTenantRoleLevel() && {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'center',
        render: enableRender,
      },
      isTenantRoleLevel() && {
        title: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        width: 100,
        render: (_, record) => {
          return currentTenantId === record.tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 140,
        align: 'center',
        render: (_, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.showEditModal(record);
              }}
            >
              {intl.get('hpfm.lov.view.option.setting').d('配置')}
            </a>
            <a
              onClick={() => {
                this.showLovComponent(true, record);
              }}
            >
              {intl.get('hpfm.lov.view.option.preview').d('预览')}
            </a>
          </span>
        ),
      },
    ].filter(Boolean);
    return {
      rowKey: 'viewHeaderId',
      columns,
      loading,
      rowSelection: null,
    };
  }
}
