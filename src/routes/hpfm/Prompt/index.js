/**
 * Prompt 平台多语言
 * @date: 2018-6-22
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Popconfirm, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import PromptDrawer from './PromptDrawer';
import FilterForm from './FilterForm';

@connect(({ loading, prompt, user }) => ({
  prompt,
  user,
  fetchPromptLoading: loading.effects['prompt/fetchPromptList'],
  saving: loading.effects['prompt/createPrompt'],
}))
@formatterCollections({ code: 'hpfm.prompt' })
export default class Prompt extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      modalVisible: false,
      promptFormData: {},
    };
  }

  form;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'prompt/init' });
    this.fetchPromptList();
  }

  /**
   * 获取查询表单组件this对象
   * @param {object} ref - 查询表单组件this
   */
  @Bind()
  handleBindRef(ref) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取多语言数据
   * @param {object} params
   */
  fetchPromptList(params = {}) {
    const {
      dispatch,
      prompt: { pagination = {} },
    } = this.props;
    const { tenantId } = this.state;
    const filterValue = this.form === undefined ? {} : this.form.getFieldsValue();
    dispatch({
      type: 'prompt/fetchPromptList',
      payload: { ...filterValue, page: pagination, tenantId, ...params },
    });
  }

  /**
   * 查询多语言
   */
  @Bind()
  handleSearch() {
    this.fetchPromptList({ page: {} });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleResetSearch() {
    this.form.resetFields();
  }

  /**
   * 分页
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchPromptList({
      page: pagination,
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag });
  }

  /**
   * 打开模态框
   */
  @Bind()
  showModal() {
    this.setState({
      promptFormData: {},
    });
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 编辑打开模态框
   */
  @Bind()
  handleUpdatePrompt(record) {
    this.setState({
      promptFormData: record,
    });
    this.handleModalVisible(true);
  }

  /**
   * 保存多语言
   * @param {object} fieldsValue - 编辑或新增的数据
   */
  @Bind()
  handleSavePrompt(fieldsValue) {
    const { dispatch } = this.props;
    const { promptFormData } = this.state;
    const params =
      promptFormData.promptCode !== undefined
        ? {
            body: [
              {
                ...promptFormData,
                ...fieldsValue,
              },
            ],
          }
        : {
            body: [{ ...fieldsValue }],
          };
    dispatch({
      type: 'prompt/createPrompt',
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchPromptList();
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDeletePrompt(record) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    if (tenantId !== record.tenantId) {
      notification.warning({
        message: intl.get('hpfm.prompt.view.message.delete').d('请勿删除平台数据'),
      });
      return;
    }
    dispatch({
      type: 'prompt/deletePrompt',
      payload: { ...record, tenantId: record.tenantId || tenantId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchPromptList();
      }
    });
  }

  /**
   * 改变租户
   */
  @Bind()
  handleChangeOrg(text, record) {
    this.setState({ tenantId: record.tenantId });
    this.fetchPromptList({ tenantId: record.tenantId });
  }

  render() {
    const {
      fetchPromptLoading,
      saving,
      user: {
        currentUser: { tenantName },
      },
      prompt: { promptList = [], pagination = {}, languageList = [] },
    } = this.props;
    const { promptFormData, modalVisible, tenantId } = this.state;
    const promptColumns = [
      {
        title: intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码'),
        width: 200,
        dataIndex: 'promptKey',
      },
      {
        title: intl.get('hpfm.prompt.model.prompt.promptCode').d('代码'),
        width: 400,
        dataIndex: 'promptCode',
      },
      {
        title: intl.get('hpfm.prompt.model.prompt.lang').d('语言'),
        width: 100,
        align: 'center',
        dataIndex: 'langDescription',
      },
      {
        title: intl.get('hpfm.prompt.model.prompt.description').d('描述'),
        dataIndex: 'description',
      },
      isTenantRoleLevel() && {
        title: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        width: 100,
        render: (_, record) => {
          return tenantId === record.tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 120,
        dataIndex: 'edit',
        render: (text, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  this.handleUpdatePrompt(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {tenantId === record.tenantId && (
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  onConfirm={() => {
                    this.handleDeletePrompt(record);
                  }}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              )}
            </span>
          );
        },
      },
    ].filter(Boolean);
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.prompt.view.message.title').d('平台多语言')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {!isTenantRoleLevel() && (
            <Lov
              allowClear={false}
              style={{ width: '200px', marginLeft: '8px' }}
              textValue={tenantName}
              value={tenantId}
              code="HPFM.TENANT"
              onChange={(text, record) => {
                this.handleChangeOrg(text, record);
              }}
            />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.handleSearch}
              onReset={this.handleResetSearch}
              onRef={this.handleBindRef}
              languageList={languageList}
            />
          </div>
          <Table
            bordered
            rowKey="promptId"
            loading={fetchPromptLoading}
            dataSource={promptList}
            columns={promptColumns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
          <PromptDrawer
            title={
              promptFormData.promptCode
                ? intl.get('hpfm.prompt.view.message.edit').d('编辑多语言')
                : intl.get('hpfm.prompt.view.message.create').d('新建多语言')
            }
            loading={saving}
            modalVisible={modalVisible}
            initData={promptFormData}
            languageList={languageList}
            onCancel={this.hideModal}
            onOk={this.handleSavePrompt}
          />
        </Content>
      </React.Fragment>
    );
  }
}
