import React, { PureComponent } from 'react';
import {
  Form,
  Modal,
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  Tooltip,
  Icon,
  Row,
  Col,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isObject, isString, forEach, isNumber, isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import RoleModal from './RoleModal';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  state = {
    ownedRoleList: [],
    selectedRowKeys: [],
    visibleRole: false,
  };

  componentDidMount() {
    this.queryOwnedRole();
  }

  // 查询当前已分配角色
  @Bind()
  queryOwnedRole(fields = {}) {
    const { dispatch, initData = {} } = this.props;
    const createFlag = isUndefined(initData.id);
    if (!createFlag) {
      dispatch({
        type: 'client/roleCurrent',
        payload: {
          userId: initData.id,
          memberType: 'client',
          page: isEmpty(fields) ? {} : fields,
        },
      }).then(res => {
        if (res) {
          this.setState({
            ownedRoleList: res.content,
          });
        }
      });
    }
  }

  @Bind()
  onOk() {
    const { onOk, form } = this.props;
    form.validateFields((error, fieldsValue) => {
      if (!error) {
        onOk(fieldsValue);
      }
    });
  }

  /**
   * 校验客户端名称
   * @param rule
   * @param value
   * @param callback
   */
  @Bind()
  checkName(rule, value, callback) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'client/checkClient',
      payload: {
        tenantId,
        name: value,
      },
    }).then(res => {
      if (isJSON(res) && JSON.parse(res).failed) {
        callback(JSON.parse(res).message);
      } else {
        callback();
      }
    });
  }

  @Bind()
  isJson(string) {
    try {
      if (typeof JSON.parse(string) === 'object') {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  // 校验作用域和自动授权域
  @Bind()
  validateSelect(rule, value, callback, name) {
    const length = value && value.length;
    if (length) {
      const reg = new RegExp(/^[A-Za-z]+$/);
      if (!reg.test(value[length - 1]) && name === 'scope') {
        callback(intl.get('hiam.client.view.validate.scope').d(`作用域只能包含英文字母`));
        return;
      } else if (!reg.test(value[length - 1]) && name === 'autoApprove') {
        callback(intl.get('hiam.client.view.validate.autoApprove').d(`自动授权域只能包含英文字母`));
        return;
      }

      if (length > 6) {
        callback(intl.get('hiam.client.view.validate.maxLength').d('最多只能输入6个域'));
        return;
      }
    }
    callback();
  }

  // 初始化 授权类型
  @Bind()
  getAuthorizedGrantTypes() {
    const { initData = {} } = this.props;
    const createFlag = isUndefined(initData.id);
    if (createFlag) {
      return ['password', 'implicit', 'client_credentials', 'authorization_code', 'refresh_token'];
    } else {
      return initData.authorizedGrantTypes ? initData.authorizedGrantTypes.split(',') : [];
    }
  }

  // 删除选中的角色
  @Bind()
  handleRoleRemoveBtnClick() {
    const { initData = {}, dispatch, paginationRole } = this.props;
    const { selectedRowKeys } = this.state;
    const that = this;
    if (selectedRowKeys.length === 0) {
      Modal.error({
        content: intl.get('hiam.client.view.message.chooseRoleFirst').d('请先选择要删除的角色'),
      });
      return;
    }
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示框?'),
      content: intl.get(`hiam.client.view.message.title.content`).d('确定删除吗？'),
      onOk() {
        const ids = [];
        selectedRowKeys.forEach(item => {
          ids.push({
            roleId: item,
            memberType: 'client',
            memberId: initData.id,
          });
        });
        dispatch({
          type: 'client/deleteRoles',
          payload: {
            memberRoleList: ids,
          },
        }).then(res => {
          if (res) {
            that.queryOwnedRole(paginationRole);
            that.setState({ selectedRowKeys: [] });
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 渲染 分配角色Table
   */
  @Bind()
  renderRoleTable() {
    const { ownedRoleList = [], selectedRowKeys = [] } = this.state;
    const { isSameUser, fetchOwnedLoading, paginationRole } = this.props;
    const rowSelection = isSameUser
      ? null
      : {
          selectedRowKeys,
          onChange: this.handleRoleSelectionChange,
        };
    const columns = [
      {
        title: intl.get('hiam.client.model.client.roleName').d('角色名称'),
        dataIndex: 'name',
        width: 120,
      },
      {
        title: intl.get('hiam.client.model.client.assignLevelValue').d('分配层级值'),
        dataIndex: 'assignLevelValue',
        width: 140,
        render: (item, record) => {
          return record.tenantName;
        },
      },
    ];
    return (
      <Table
        rowKey="id"
        bordered
        onChange={this.queryOwnedRole}
        loading={fetchOwnedLoading}
        rowSelection={rowSelection}
        dataSource={ownedRoleList}
        columns={columns}
        pagination={paginationRole}
      />
    );
  }

  /**
   * 打开新增角色 选择模态框
   */
  @Bind()
  handleRoleAddBtnClick() {
    const { ownedRoleList = [] } = this.state;
    const roleModalProps = {
      excludeRoleIds: [],
      excludeUserIds: [],
    };
    ownedRoleList.forEach(r => {
      roleModalProps.excludeRoleIds.push(r.id);
    });
    this.setState({
      visibleRole: true,
      roleModalProps,
    });
  }

  @Bind()
  fetchRoles(fields) {
    const { fetchAllRoles } = this.props;
    return fetchAllRoles(fields);
  }

  /**
   * 新增角色模态框确认按钮点击
   */
  @Bind()
  handleRoleAddSaveBtnClick(roles) {
    const { tenantId, dispatch, paginationRole, initData } = this.props;
    const memberRoleList = [];
    forEach(roles, record => {
      const newRecord = {
        roleId: record.id,
        assignLevel: 'organization',
        memberType: 'client',
        memberId: initData.id,
        sourceId: tenantId,
        sourceType: record.level,
      };
      newRecord.assignLevelValue = record.assignLevelValue || tenantId;
      if (!isEmpty(newRecord.assignLevel) && isNumber(newRecord.assignLevelValue)) {
        memberRoleList.push(newRecord);
      }
    });

    return dispatch({
      type: 'client/saveRoleSet',
      payload: [...memberRoleList],
    }).then(res => {
      if (res) {
        this.setState(
          {
            visibleRole: false,
          },
          () => {
            notification.success();
            this.queryOwnedRole(paginationRole);
          }
        );
      }
    });
  }

  /**
   * 新增角色模态框取消按钮点击
   */
  @Bind()
  handleRoleAddCancelBtnClick() {
    this.setState({
      visibleRole: false,
    });
  }

  /**
   * @param {String[]} selectedRowKeys 选中的rowKey
   */
  @Bind()
  handleRoleSelectionChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      form,
      initData = {},
      typeList = [],
      title,
      visible,
      onCancel,
      loading,
      loadingDistributeUsers,
      saveRoleLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    const { selectedRowKeys, visibleRole, roleModalProps = {} } = this.state;
    const updateFlag = !isUndefined(initData.id);
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        width={1000}
        title={title}
        visible={visible}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onOk={this.onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form>
          <Row gutter={24} type="flex">
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hiam.client.model.client.name').d('客户端名称')}
              >
                {getFieldDecorator('name', {
                  initialValue: initData.name,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.client.model.client.name').d('客户端名称'),
                      }),
                    },
                    {
                      pattern: /^[0-9a-zA-Z-]{0,32}$/,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hiam.client.model.client.name')
                          .d('客户端名称只能由1-32位的数字或字母或中划线组成'),
                      }),
                    },
                    {
                      validator: !updateFlag && this.checkName,
                    },
                  ],
                  validateTrigger: 'onBlur',
                })(<Input disabled={updateFlag} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hiam.client.model.client.secret').d('密钥')}
              >
                {getFieldDecorator('secret', {
                  initialValue: initData.secret,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.client.model.client.secret').d('密钥'),
                      }),
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hiam.client.model.client.authorizedGrantTypes').d('授权类型')}
              >
                {getFieldDecorator('authorizedGrantTypes', {
                  // initialValue: initData.authorizedGrantTypes,
                  initialValue: this.getAuthorizedGrantTypes(),
                  rules: [
                    {
                      type: 'array',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hiam.client.model.client.authorizedGrantTypes')
                          .d('授权类型'),
                      }),
                    },
                  ],
                })(
                  <Select mode="multiple" style={{ width: '100%' }}>
                    {typeList.map(item => {
                      return (
                        <Option label={item.meaning} value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl
                  .get('hiam.client.model.client.accessTokenValidity')
                  .d('访问授权超时(秒)')}
              >
                {getFieldDecorator('accessTokenValidity', {
                  initialValue: !updateFlag
                    ? 3600
                    : initData.accessTokenValidity
                    ? parseInt(initData.accessTokenValidity, 10)
                    : undefined,
                })(<InputNumber style={{ width: '100%' }} min={60} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hiam.client.model.client.refreshTokenValidity').d('授权超时(秒)')}
              >
                {getFieldDecorator('refreshTokenValidity', {
                  initialValue: !updateFlag
                    ? 3600
                    : initData.refreshTokenValidity
                    ? parseInt(initData.refreshTokenValidity, 10)
                    : undefined,
                })(<InputNumber style={{ width: '100%' }} min={60} />)}
              </FormItem>
            </Col>
            {updateFlag && (
              <Col span={12}>
                <FormItem
                  {...formLayout}
                  // label={intl.get('hiam.client.model.client.scope').d('作用域')}
                  label={
                    <span>
                      {intl.get('hiam.client.model.client.scope').d('作用域')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.client.view.message.scope.help.msg')
                          .d('作用域为申请的授权范围。您最多可输入6个域')}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('scope', {
                    initialValue: initData.scope ? initData.scope.split(',') : [],
                    rules: [
                      {
                        validator: (rule, value, callback) =>
                          this.validateSelect(rule, value, callback, 'scope'),
                      },
                    ],
                    validateTrigger: 'onChange',
                  })(<Select mode="tags" style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            )}
            {updateFlag && (
              <Col span={12}>
                <FormItem
                  {...formLayout}
                  // label={intl.get('hiam.client.model.client.autoApprove').d('自动授权域')}
                  label={
                    <span>
                      {intl.get('hiam.client.model.client.autoApprove').d('自动授权域')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.client.view.message.autoApprove.help.msg')
                          .d(
                            '自动授权域为oauth认证后，系统自动授权而非用户手动添加的作用域。您最多可输入6个域'
                          )}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('autoApprove', {
                    initialValue: initData.autoApprove ? initData.autoApprove.split(',') : [],
                    rules: [
                      {
                        validator: (rule, value, callback) =>
                          this.validateSelect(rule, value, callback, 'autoApprove'),
                      },
                    ],
                    validateTrigger: 'onChange',
                  })(<Select mode="tags" style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            )}
            {updateFlag && (
              <Col span={12}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hiam.client.model.client.webServerRedirectUri').d('重定向地址')}
                >
                  {getFieldDecorator('webServerRedirectUri', {
                    initialValue: initData.webServerRedirectUri,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            {updateFlag && (
              <Col span={12}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hiam.client.model.client.additionalInformation').d('附加信息')}
                >
                  {getFieldDecorator('additionalInformation', {
                    initialValue: initData.additionalInformation,
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (!value || this.isJson(value)) {
                            callback();
                          } else {
                            callback(
                              intl
                                .get('hiam.client.view.validate.additionalInformation')
                                .d('请输入正确的json字符串')
                            );
                          }
                        },
                      },
                    ],
                    validateTrigger: 'onBlur',
                  })(<TextArea rows={5} />)}
                </FormItem>
              </Col>
            )}
          </Row>
          {updateFlag && (
            <Row>
              <Col>
                <FormItem
                  label={intl.get('hiam.client.view.message.title.role').d('角色')}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                >
                  <Button
                    onClick={() => this.handleRoleAddBtnClick()}
                    style={{ marginRight: 10 }}
                    icon="plus"
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                  <Button
                    onClick={this.handleRoleRemoveBtnClick}
                    disabled={selectedRowKeys.length === 0}
                    icon="delete"
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          )}
          {updateFlag && (
            <Row type="flex">
              <Col span={3} />
              <Col span={20} className={styles['rule-table']}>
                {this.renderRoleTable()}
              </Col>
            </Row>
          )}
        </Form>

        {!!visibleRole && (
          <RoleModal
            {...roleModalProps}
            visible={visibleRole}
            fetchLoading={loadingDistributeUsers}
            saveLoading={saveRoleLoading}
            fetchRoles={this.fetchRoles}
            onSave={this.handleRoleAddSaveBtnClick}
            onCancel={this.handleRoleAddCancelBtnClick}
          />
        )}
      </Modal>
    );
  }
}
