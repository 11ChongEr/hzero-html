/**
 * index.js
 * @author WY
 * @date 2018/10/11
 * @email yang.wang06@hand-china.com
 */

import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input, Popconfirm, Table, Tag } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import EditModal from './EditModal';

const { Item: FormItem } = Form;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hpfm.profile'] })
@connect(({ loading, profileOrg }) => ({
  fetching: loading.effects['profileOrg/profileFetchList'],
  saving: loading.effects['profileOrg/profileSave'],
  profile: profileOrg,
  organizationId: getCurrentOrganizationId(),
}))
export default class ProfileOrg extends React.Component {
  render() {
    const {
      form: { getFieldDecorator },
      profile: {
        enumMap: { levelCode = [] },
        list = [],
        pagination = false,
        editModalVisible = false,
        profileValue = {},
        isCreate = true,
      },
      organizationId,
      fetching = false,
      saving = false,
    } = this.props;
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.profile.view.message.form.title').d('配置维护管理')}>
          <Button onClick={this.handleAddBtnClick} icon="plus" type="primary">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Form layout="inline">
              <FormItem label={intl.get('hpfm.profile.model.profile.name').d('配置编码')}>
                {getFieldDecorator('profileName', {})(
                  <Input typeCase="upper" inputChinese={false} />
                )}
              </FormItem>
              <FormItem>
                <Button onClick={this.fetchList} type="primary" htmlType="submit">
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleResetForm}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </FormItem>
            </Form>
          </div>
          <Table
            bordered
            rowKey="profileId"
            columns={this.getColumns()}
            dataSource={list}
            pagination={pagination}
            onChange={this.queryList}
            loading={fetching}
          />
          <EditModal
            title={intl.get('hpfm.profile.view.message.title').d('配置维护')}
            width={1000}
            visible={editModalVisible}
            profileValue={profileValue}
            isCreate={isCreate}
            onCancel={this.closeModal}
            levelCode={levelCode}
            onRecordRemove={this.handleProfileValueRemove}
            onOk={this.handleSaveProfile}
            okButtonProps={{ loading: saving }}
            tenantId={organizationId}
          />
        </Content>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.fetchBatchEnums();
    this.queryList();
  }

  @Bind()
  fetchBatchEnums() {
    const { dispatch } = this.props;
    dispatch({
      type: 'profileOrg/fetchBatchEnums',
    });
  }

  @Bind()
  handleResetForm() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * form submit
   */
  @Bind()
  fetchList(e) {
    e.preventDefault();
    this.queryList();
  }

  @Bind()
  queryList(page, sort) {
    // queryList
    const { dispatch, form, organizationId } = this.props;
    const formValues = form.getFieldsValue();
    dispatch({
      type: 'profileOrg/profileFetchList',
      payload: {
        organizationId,
        payload: { page, sort, body: formValues },
      },
    });
  }

  @Bind()
  reloadList() {
    // reloadList
    const {
      profile: { pagination },
    } = this.props;
    this.queryList(pagination);
  }

  @Bind()
  getColumns() {
    const { organizationId } = this.props;
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('hpfm.profile.model.profile.name').d('配置编码'),
          dataIndex: 'profileName',
          width: 150,
        },
        {
          title: intl.get('hpfm.profile.model.profile.description').d('配置描述'),
          dataIndex: 'description',
        },
        {
          title: intl.get('hzero.common.source').d('来源'),
          align: 'center',
          width: 100,
          render: (_, record) => {
            return organizationId === record.tenantId ? (
              <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
            ) : (
              <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
            );
          },
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          render: (item, record) =>
            record.profileLevel !== 'P' && ( // 租户 不可以 更新 平台级的数据
              <span className="action-link">
                <a
                  onClick={() => {
                    this.handleProfileEdit(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  onConfirm={() => {
                    this.handleProfileRemove(record);
                  }}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              </span>
            ),
        },
      ];
    }
    return this.columns;
  }

  @Bind()
  handleAddBtnClick() {
    // open new Modal
    const { dispatch } = this.props;
    dispatch({
      type: 'profileOrg/openNewModal',
    });
  }

  /**
   * remove profile
   * @param {Object} profile
   */
  @Bind()
  handleProfileRemove(profile) {
    // remove profile
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'profileOrg/profileRemoveOne',
      payload: {
        organizationId,
        payload: profile,
      },
    }).then(res => {
      if (res) {
        // 返回第一页
        notification.success();
        this.queryList();
      }
    });
  }

  @Bind()
  handleProfileEdit(record) {
    // edit
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'profileOrg/openEditModal',
      payload: {
        organizationId,
        payload: record.profileId,
      },
    });
  }

  @Bind()
  closeModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'profileOrg/closeModal',
    });
  }

  @Bind()
  handleSaveProfile(profile) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'profileOrg/profileSave',
      payload: {
        organizationId,
        payload: profile,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.closeModal();
        this.reloadList();
      }
    });
  }

  @Bind()
  handleProfileValueRemove(removeRecord) {
    const { dispatch, organizationId } = this.props;
    return dispatch({
      type: 'profileOrg/profileValueRemove',
      payload: {
        organizationId,
        payload: removeRecord,
      },
    });
  }
}
