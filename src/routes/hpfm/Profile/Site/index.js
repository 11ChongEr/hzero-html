/**
 * index.js
 * @author WY
 * @date 2018/10/11
 * @email yang.wang06@hand-china.com
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Popconfirm, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';
import ValueList from 'components/ValueList';
import notification from 'utils/notification';
import EditModal from './EditModal';

const { Item: FormItem } = Form;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hpfm.profile'] })
@connect(({ loading, profile }) => ({
  fetching: loading.effects['profile/profileFetchList'],
  saving: loading.effects['profile/profileSave'],
  profile,
}))
export default class ProfileSite extends React.Component {
  render() {
    const {
      form: { getFieldDecorator },
      profile: {
        enumMap: { level = [], levelCode = [] },
        list = [],
        pagination = false,
        editModalVisible = false,
        profileValue = {},
        isCreate = true,
      },
      fetching,
      saving,
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
              <FormItem label={intl.get('hpfm.profile.model.profile.level').d('维度')}>
                {getFieldDecorator('profileLevel', {})(
                  <ValueList options={level} style={{ width: 150 }} allowClear />
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
            level={level}
            levelCode={levelCode}
            onRecordRemove={this.handleProfileValueRemove}
            onOk={this.handleSaveProfile}
            okButtonProps={{
              loading: saving,
            }}
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
      type: 'profile/fetchBatchEnums',
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
    const { dispatch, form } = this.props;
    const formValues = form.getFieldsValue();
    dispatch({
      type: 'profile/profileFetchList',
      payload: {
        page,
        sort,
        body: formValues,
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
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('hpfm.profile.model.profile.name').d('配置编码'),
          dataIndex: 'profileName',
          width: 150,
        },
        {
          title: intl.get('hpfm.profile.model.profile.level').d('维度'),
          dataIndex: 'profileLevelMeaning',
          width: 100,
        },
        {
          title: intl.get('hpfm.profile.model.profile.tenant').d('租户'),
          dataIndex: 'tenantName',
          width: 200,
        },
        {
          title: intl.get('hpfm.profile.model.profile.description').d('配置描述'),
          dataIndex: 'description',
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          render: (item, record) => (
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
      type: 'profile/openNewModal',
    });
  }

  /**
   * remove profile
   * @param {Object} profile
   */
  @Bind()
  handleProfileRemove(profile) {
    // remove profile
    const { dispatch } = this.props;
    dispatch({
      type: 'profile/profileRemoveOne',
      payload: profile,
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
    const { dispatch } = this.props;
    dispatch({
      type: 'profile/openEditModal',
      payload: record.profileId,
    });
  }

  @Bind()
  closeModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'profile/closeModal',
    });
  }

  @Bind()
  handleSaveProfile(profile) {
    const { dispatch } = this.props;
    dispatch({
      type: 'profile/profileSave',
      payload: profile,
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
    const { dispatch } = this.props;
    return dispatch({
      type: 'profile/profileValueRemove',
      payload: removeRecord,
    });
  }
}
