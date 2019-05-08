/**
 * EditModal.js
 * 当编辑自己的帐号时, 角色时不可以新增和删除的
 * @date 2018-12-16
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import {
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  Modal,
  Input,
  DatePicker,
  Switch,
  Button,
  Table,
} from 'hzero-ui';
import { differenceWith, forEach, isEmpty, isUndefined, join, map, find } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import PropTypes from 'prop-types';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import {
  addItemsToPagination,
  createPagination,
  delItemsToPagination,
  getDateFormat,
  getEditTableData,
  tableScrollWidth,
} from 'utils/utils';
import { EMAIL, PASSWORD, PHONE } from 'utils/regExp';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import styles from '../../index.less';
import RoleModal from './RoleModal';

const colLayout = {
  md: 12,
};

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};

@Form.create({ fieldNameProp: null })
export default class EditModal extends React.Component {
  state = {
    selectedRowKeys: [],
    roleModalProps: {}, // 新建角色框
    // 角色表格的信息
    dataSource: [],
    pagination: false,
    roleTableFetchLoading: false, // 角色加载数据 和 翻页改变
  };

  rolePaginationCache; // 角色 Table 分页信息的缓存

  // todo 最后 页面的 propTypes 推荐 全部删掉
  static propTypes = {
    fetchRoles: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      isCreate = true,
      editRecord: { defaultRoleId } = {}, // editRecord 在 新增时 为 undefined
    } = nextProps;
    const nextState = {};
    if (isCreate && prevState.pagination !== false) {
      nextState.pagination = false;
    }
    if (defaultRoleId !== prevState.initDefaultRoleId) {
      nextState.defaultRoleId = defaultRoleId;
      nextState.initDefaultRoleId = defaultRoleId;
    }
    if (isEmpty(nextState)) {
      return null;
    }
    return nextState;
  }

  componentDidMount() {
    const { isCreate = true } = this.props;
    if (!isCreate) {
      this.handleRoleTableChange();
    }
  }

  @Bind()
  changeCountryId() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ regionId: undefined });
  }

  /**
   * 角色 table 分页改变
   * 如果是新增用户 分页是
   * @param {object} page
   * @param {object} filter
   * @param {object} sort
   */
  @Bind()
  handleRoleTableChange(page, filter, sort) {
    const {
      fetchCurrentUserRoles,
      isCreate = true,
      isSameUser = true,
      editRecord = {},
    } = this.props;
    if (!isCreate) {
      this.showRoleTableLoading();
      fetchCurrentUserRoles({ page, sort, userId: editRecord.id })
        .then(roleContent => {
          // 在前面中已经 getResponse 了
          if (roleContent) {
            this.setState({
              dataSource: isSameUser
                ? roleContent.content
                : map(roleContent.content, r => {
                    return { ...r, _status: 'update' };
                  }),
              pagination: createPagination(roleContent),
            });
            // 翻页清空 已取消默认角色的租户
          }
        })
        .finally(() => {
          this.hiddenRoleTableLoading();
        });
    }
  }

  @Bind()
  showRoleTableLoading() {
    this.setState({ roleTableFetchLoading: true });
  }

  @Bind()
  hiddenRoleTableLoading() {
    this.setState({ roleTableFetchLoading: false });
  }

  // @Bind()
  // isRoleCanUpdate(role = {}, account = {}) {
  //   if (role._status === 'create') {
  //     return true;
  //   }
  //   // 只检查了 层级 为 平台 和 租户的情况
  //   if (role.assignLevel === 'site' || role.assignLevel === 'organization') {
  //     if (role.assignLevelValue !== (account.organizationId || account.tenantId)) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  getRoleColumns() {
    if (!this.roleColumns) {
      this.roleColumns = [
        {
          title: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
          dataIndex: 'name',
          width: 120,
        },
        {
          title: intl.get('hiam.subAccount.model.role.assignLevel').d('分配层级'),
          dataIndex: 'assignLevel',
          width: 100,
          render: (item, record) => {
            const {
              isSameUser = true, // 如果编辑的用户是当前登录的用户, 则不能修改角色 和 租户
              levelMap,
            } = this.props;
            // levelValue 当前选中的值tag
            if (isSameUser) {
              // todo 到底该不该后台返回正确的值呢
              return levelMap && levelMap[item];
              // return record.assignLevelMeaning;
            } else {
              const { $form: form } = record;
              return (
                <Form.Item>
                  {form.getFieldDecorator('assignLevel', {
                    initialValue: item,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.subAccount.model.role.assignLevel').d('分配层级'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }}>
                      {this.getRoleCurrentRecordLevelOptions(record)}
                    </Select>
                  )}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get('hiam.subAccount.model.role.assignLevelValue').d('分配层级值'),
          dataIndex: 'assignLevelValue',
          width: 140,
          render: (item, record) => {
            const {
              isSameUser = true, // 如果编辑的用户是当前登录的用户, 则不能修改角色 和 租户
            } = this.props;
            const { $form: form } = record;
            if (isSameUser) {
              return record.assignLevelValueMeaning;
            }
            const assignLevel = form.getFieldValue('assignLevel');
            if (assignLevel) {
              if (assignLevel === 'site' || assignLevel === 'organization') {
                // 当是第一次进来编辑的时候 使用上一次的tenantName 否则使用选中角色的租户名称
                return record.assignLevelValueMeaning || record.tenantName;
              } else if (record.assignLevel === 'org') {
                // 选择组织
                return (
                  <Form.Item>
                    {form.getFieldDecorator('assignLevelValue', {
                      initialValue: item,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hiam.subAccount.model.role.assignLevelValue')
                              .d('分配层级值'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="HIAM.ASSIGN_LEVEL_VALUE_ORG"
                        queryParams={{ roleId: record.id }}
                        textValue={record.assignLevelValueMeaning}
                      />
                    )}
                  </Form.Item>
                );
              }
            } else {
              // 如果没有选中分配层级, 则不可改变
              return '';
            }
          },
        },
        {
          title: intl.get('hiam.subAccount.model.role.defaultRoleId').d('默认'),
          key: 'defaultRoleId',
          width: 80,
          render: (_, record) => {
            const { defaultRoleId, assignLevel } = record;
            if (assignLevel === 'organization') {
              return (
                <Checkbox
                  checked={!isUndefined(defaultRoleId)}
                  onClick={() => {
                    this.handleRoleDefaultChange(record);
                  }}
                />
              );
            }
            return null;
          },
        },
      ];
    }
    return this.roleColumns;
  }

  /**
   * 渲染当前记录可选择的层级
   * 只能选择 组织层 和 租户层 且 层级小于等于 当前角色层级
   * @param {Object} record 当前记录
   */
  @Bind()
  getRoleCurrentRecordLevelOptions(record) {
    // 获取当前角色可以选择的 层级值,
    // 如果没有 则需要返回当前update角色本身的层级
    // const { form, levelMap = {}, level = [], isCreate = true } = this.props;
    const { levelMap = {}, level = [] } = this.props;
    const options = [];
    // 通过选中的id获取到一整条roleMap
    const currentRole = record;
    // 返回的是值集里面的数据，值tag
    if (!isEmpty(currentRole)) {
      forEach(level, item => {
        if (
          item.value !== 'site' &&
          +item.tag >= (levelMap[currentRole.parentRoleAssignLevel] || {}).tag
        ) {
          options.push(
            <Select.Option value={item.value} key={item.value}>
              {item.meaning}
            </Select.Option>
          );
        }
        // if (
        //   (form.getFieldValue('organizationId') !== 0 && item.value === 'site') ||
        //   (item.value === 'org' && !isCreate)
        // ) {
        //   return;
        // }
        // if (+item.tag >= (levelMap[currentRole.parentRoleAssignLevel] || {}).tag) {
        //   options.push(
        //     <Select.Option value={item.value} key={item.value}>
        //       {item.meaning}
        //     </Select.Option>
        //   );
        // }
      });
    }
    if (options.length === 0) {
      // 如果 该角色 没有分配层级, 应当将当前的 层级加进来
      const currentLevel = levelMap[currentRole.assignLevel];
      if (currentLevel) {
        options.push(
          <Select.Option key={currentLevel.value} value={currentLevel.value}>
            {currentLevel.meaning}
          </Select.Option>
        );
      }
    }
    return options;
  }

  @Bind()
  handleRowSelectChange(_, selectedRows = []) {
    this.setState({
      selectedRowKeys: map(selectedRows, r => r.id),
      selectedRows,
    });
  }

  @Bind()
  handleRoleDefaultChange(record) {
    let nextDefaultRoleId = record.id;
    if (!isUndefined(record.defaultRoleId)) {
      // 已经是 默认角色了 什么都不做 则取消默认角色并将该租户加入 删除角色租户中
      nextDefaultRoleId = undefined;
    }
    const { dataSource = [] } = this.state;
    const newDataSource = dataSource.map(item => {
      if (item.id === record.id) {
        return {
          ...item,
          defaultRoleId: nextDefaultRoleId,
          defaultRoleIdUpdate: true,
        };
      } else if (
        item.assignLevel === record.assignLevel &&
        item.assignLevelValue === record.assignLevelValue
      ) {
        // item 取消同租户的 defaultRoleId
        const { defaultRoleId: _, ...newRole } = item;
        return {
          ...newRole,
          // defaultRoleIdUpdate: true,
        };
      } else {
        return item;
      }
    });
    this.setState({
      dataSource: newDataSource,
    });
  }

  @Bind()
  handleRoleRemove() {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示框?'),
      content: intl.get(`hiam.subAccount.view.message.title.content`).d('确定删除吗？'),
      onOk: () => {
        const { selectedRows = [], defaultRoleId = -1 } = this.state;
        const { editRecord = {}, onRoleRemove } = this.props;
        const remoteRemoveDataSource = [];
        let updateDefaultRoleId = defaultRoleId;
        forEach(selectedRows, r => {
          if (r.id === defaultRoleId) {
            updateDefaultRoleId = -1;
          }
          if (r._status === 'update') {
            remoteRemoveDataSource.push({
              roleId: r.id,
              memberId: editRecord.id,
            });
          }
        });
        if (remoteRemoveDataSource.length > 0) {
          onRoleRemove(remoteRemoveDataSource).then(res => {
            if (res) {
              this.removeLocaleRoles(updateDefaultRoleId);
            }
          });
        } else {
          this.removeLocaleRoles(updateDefaultRoleId);
        }
      },
    });
  }

  @Bind()
  removeLocaleRoles(updateDefaultRoleId) {
    const nextState = {};
    if (updateDefaultRoleId === -1) {
      nextState.defaultRoleId = -1;
    }
    const { dataSource = [], selectedRowKeys = [], pagination = {} } = this.state;
    const { isCreate = true } = this.props;
    nextState.dataSource = differenceWith(dataSource, selectedRowKeys, (r1, r2) => r1.id === r2);
    nextState.pagination = isCreate
      ? false
      : delItemsToPagination(selectedRowKeys.length, dataSource.length, pagination);
    nextState.selectedRowKeys = [];
    nextState.selectedRows = [];
    this.setState(nextState);
  }

  @Bind()
  handleRoleCreate() {
    const { editRecord = {}, isCreate = true } = this.props;
    const { dataSource = [] } = this.state;
    const excludeUserIds = []; // 当前编辑帐号的帐号id( 需要的排除帐号对应的角色 )
    const excludeRoleIds = [];
    if (!isCreate) {
      excludeUserIds.push(editRecord.id);
    }
    dataSource.forEach(role => {
      if (role._status === 'create') {
        excludeRoleIds.push(role.id);
      }
    });
    this.setState({
      roleModalProps: {
        visible: true,
        excludeUserIds,
        excludeRoleIds,
      },
    });
  }

  @Bind()
  handleRoleCreateSave(roles) {
    if (roles && roles.length > 0) {
      const { dataSource = [], pagination = {} } = this.state;
      const { isCreate = true } = this.props;
      this.setState({
        dataSource: [
          ...dataSource,
          ...roles.map(role => {
            // 保存时的数据结构
            // assignLevel: "organization" // 层级
            // assignLevelValue: 180149 // 层级值
            // memberType: "user" // 恒定为 user
            // roleId: 150191 // 角色id
            // sourceId: 180149 // 当前用户所属租户
            // sourceType: "organization" // 当前租户层级

            // todo 角色层级值 的取值 到底需要怎么做
            const assignLevel =
              role.level === 'site' || role.level === 'organization' ? 'organization' : 'org';
            let assignLevelValue = role.tenantId;
            let assignLevelValueMeaning = role.tenantName;
            if (assignLevel !== 'organization') {
              assignLevelValue = undefined;
              assignLevelValueMeaning = undefined;
            }
            return {
              // 角色名称 展示使用
              name: role.name,
              // 用来限制 层级值
              parentRoleAssignLevel: role.parentRoleAssignLevel,
              // 角色id
              id: role.id,
              // sourceType 是 选中角色的 level
              sourceType: role.level,
              // memberType 是固定的 user
              memberType: 'user',
              // assignLevel 和 assignLevelValue 是需要自己填写的
              assignLevel,
              assignLevelValue,
              assignLevelValueMeaning,
              _status: 'create',
            };
          }),
        ],
        pagination: isCreate
          ? false
          : addItemsToPagination(roles.length, dataSource.length, pagination),
      });
    }
    this.handleRoleCreateCancel();
  }

  @Bind()
  handleRoleCreateCancel() {
    this.setState({
      roleModalProps: {
        visible: false,
      },
    });
  }

  @Bind()
  handleEditModalOk() {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const { dataSource = [] } = this.state;
        const memberRoleList = [];
        const defaultRoleIds = [];
        const cancelDefaultParams = new Set();

        const validatingDataSource = dataSource.filter(
          r => r._status === 'create' || r._status === 'update'
        );
        const validateDataSource = getEditTableData(validatingDataSource);
        validateDataSource.forEach(r => {
          // // 如果 assignLevelValue 有值, 则使用他的值, 否则通过 层级 来确定层级值
          // const assignLevelValue = isUndefined(r.assignLevelValue)
          //   ? r.assignLevel === 'site' || r.assignLevel === 'organization'
          //     ? fieldsValue.organizationId
          //     : undefined
          //   : r.assignLevelValue;
          // 去掉前端添加的字段
          const { defaultRoleIdUpdate, ...oriRecord } = r;
          const newRole = {
            ...oriRecord, // 需要得到之前角色的 id 等信息
            assignLevel: r.assignLevel, // 层级
            // 当 层级 为 组织 和 租户 时, 层级值为 租户id
            assignLevelValue: r.assignLevelValue, // 层级值
            memberType: 'user', // 恒定为 user
            roleId: r.id, // 角色id
            sourceId: fieldsValue.organizationId, // 当前用户所属租户
            sourceType: r.sourceType, // 当前租户层级
          };
          const oldR = find(dataSource, or => or.id === r.id);
          if (
            newRole.assignLevel === 'organization' &&
            defaultRoleIdUpdate &&
            isUndefined(newRole.defaultRoleId)
          ) {
            // 该角色是租户层 默认角色更新过 且 取消了
            cancelDefaultParams.add(newRole.assignLevelValue);
          }
          if (
            // 数据校验
            !isUndefined(newRole.assignLevel) &&
            !isUndefined(newRole.assignLevelValue) &&
            // 重复校验
            (oldR._status === 'create' ||
              (oldR._status === 'update' &&
                (oldR.assignLevel !== newRole.assignLevel ||
                  oldR.assignLevelValue !== newRole.assignLevelValue ||
                  defaultRoleIdUpdate))) // || // 默认角色更改 直接更改了原来的 dataSource
            // oldR.defaultRoleId !== newRole.defaultRoleId
            // 如果是正常流程 这两个是一定相同的
            // || oldR.sourceId !== newRole.sourceId
            // || oldR.sourceType !== newRole.sourceType
          ) {
            // 全部填完才能保存
            if (!isUndefined(newRole.defaultRoleId)) {
              defaultRoleIds.push(newRole.id);
            }
            memberRoleList.push(newRole);
          }
        });
        if (dataSource.length !== 0 && validatingDataSource.length !== validateDataSource.length) {
          // 必须要有角色, 且校验通过
          return;
        }
        const { editRecord = {}, onOk } = this.props;
        const saveData = {
          ...editRecord,
          ...fieldsValue,
          startDateActive: fieldsValue.startDateActive.format(DEFAULT_DATE_FORMAT),
          endDateActive: fieldsValue.endDateActive
            ? fieldsValue.endDateActive.format(DEFAULT_DATE_FORMAT)
            : undefined,
          birthday: fieldsValue.birthday
            ? fieldsValue.birthday.format(DEFAULT_DATE_FORMAT)
            : undefined,
          defaultRoleIds,
          memberRoleList,
          cancelDefaultParams: [...cancelDefaultParams.values()].filter(tId => {
            // 判断取消的租户 是否又勾选了
            return !validateDataSource.some(r => {
              return (
                r.assignLevel === 'organization' &&
                r.assignLevelValue === tId &&
                !isUndefined(r.defaultRoleId)
              );
            });
          }),
        };
        onOk(saveData);
      }
    });
  }

  renderForm() {
    const {
      form,
      editRecord = {},
      isCreate = true,
      isSameUser = true,
      idd = [],
      gender = [],
    } = this.props;
    const {
      selectedRowKeys = [],
      dataSource = [],
      pagination = false,
      roleTableFetchLoading,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };

    const emailError = form.getFieldError('email');
    const sameEmail = editRecord.phone === form.getFieldValue('email');
    const phoneError = form.getFieldError('phone');
    const samePhone = editRecord.phone === form.getFieldValue('phone');
    const dateFormat = getDateFormat();
    const roleColumns = this.getRoleColumns();
    const roleNode = isSameUser ? (
      <Col key="role-same-user">
        <Form.Item
          label={intl.get('hiam.subAccount.view.message.title.role').d('角色')}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
        >
          <Table
            bordered
            pagination={false}
            rowKey="id"
            columns={roleColumns}
            scroll={{ x: tableScrollWidth(roleColumns) }}
            rowSelection={isSameUser ? null : rowSelection}
            dataSource={dataSource}
          />
        </Form.Item>
      </Col>
    ) : (
      <React.Fragment key="role-no-same-user-btn">
        <Col>
          <Form.Item
            label={intl.get('hiam.subAccount.view.message.title.role').d('角色')}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
          >
            <Button onClick={this.handleRoleCreate} style={{ marginRight: 10 }} icon="plus">
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              onClick={this.handleRoleRemove}
              disabled={selectedRowKeys.length === 0}
              icon="delete"
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form.Item>
        </Col>
        <Col>
          <Row type="flex">
            <Col span={3} />
            <Col span={20} className={styles['rule-table']}>
              <EditTable
                bordered
                rowKey="id"
                dataSource={dataSource}
                pagination={pagination}
                loading={roleTableFetchLoading}
                columns={roleColumns}
                scroll={{ x: tableScrollWidth(roleColumns) }}
                onChange={this.handleRoleTableChange}
                rowSelection={isSameUser ? null : rowSelection}
              />
            </Col>
          </Row>
        </Col>
      </React.Fragment>
    );

    return (
      <Form>
        <Row type="flex">
          {isCreate || (
            <Col key="loginName" {...colLayout}>
              <Form.Item
                {...formItemLayout}
                label={intl.get('hiam.subAccount.model.user.loginName').d('账号')}
              >
                {form.getFieldDecorator('loginName', {
                  initialValue: editRecord.loginName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.subAccount.model.user.loginName').d('账号'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          )}
          <Col key="realName" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {form.getFieldDecorator('realName', {
                initialValue: editRecord.realName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.realName').d('名称'),
                    }),
                  },
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', {
                      max: 40,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="birthday" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              key="birthday"
              label={intl.get('hiam.subAccount.model.user.birthday').d('出生日期')}
            >
              {form.getFieldDecorator('birthday', {
                initialValue: editRecord.birthday
                  ? moment(editRecord.birthday, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} placeholder="" />)}
            </Form.Item>
          </Col>
          <Col key="nickname" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.nickname').d('昵称')}
            >
              {form.getFieldDecorator('nickname', {
                initialValue: editRecord.nickname,
                rules: [
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="gender" {...colLayout}>
            <Form.Item {...formItemLayout} label={intl.get('hzero.common.gender').d('性别')}>
              {form.getFieldDecorator('gender', {
                initialValue: isUndefined(editRecord.gender) ? '' : `${editRecord.gender}`,
              })(
                <Select allowClear>
                  {map(gender, item => {
                    return (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col key="country" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.countryId').d('国家')}
            >
              {form.getFieldDecorator('countryId', {
                initialValue: editRecord.countryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  onChange={this.changeCountryId}
                  textValue={editRecord.countryName}
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="regionId" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.regionId').d('地区')}
            >
              {form.getFieldDecorator('regionId', {
                initialValue: editRecord.organizationId,
              })(
                <Lov
                  code="HPFM.REGION"
                  queryParams={{
                    countryId: form.getFieldValue('countryId'),
                  }}
                  textValue={editRecord.regionName}
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="addressDetail" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.addressDetail').d('详细地址')}
            >
              {form.getFieldDecorator('addressDetail', {
                initialValue: editRecord.addressDetail,
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          {isCreate && (
            <Col key="tenant" {...colLayout}>
              <Form.Item
                {...formItemLayout}
                label={intl.get('hiam.subAccount.model.user.tenant').d('所属租户')}
              >
                {form.getFieldDecorator('organizationId', {
                  initialValue: editRecord.organizationId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.TENANT"
                    textValue={editRecord.tenantName}
                    textField="tenantName"
                    disabled={!isCreate}
                  />
                )}
              </Form.Item>
            </Col>
          )}
          <Col {...colLayout} key="email">
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
              {...(isCreate
                ? {}
                : {
                    hasFeedback: true,
                    help: emailError
                      ? join(emailError)
                      : editRecord.emailCheckFlag
                      ? ''
                      : intl.get('hiam.subAccount.view.validation.emailNotCheck').d('邮箱未验证'),
                    validateStatus: emailError
                      ? 'error'
                      : sameEmail && editRecord.emailCheckFlag
                      ? 'success'
                      : 'warning',
                  })}
            >
              {form.getFieldDecorator('email', {
                initialValue: editRecord.email,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="phone" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
              {...(isCreate
                ? {}
                : {
                    hasFeedback: true,
                    help: phoneError
                      ? join(phoneError)
                      : editRecord.phoneCheckFlag
                      ? ''
                      : intl
                          .get('hiam.subAccount.view.validation.phoneNotCheck')
                          .d('手机号码未验证'),
                    validateStatus: phoneError
                      ? 'error'
                      : samePhone && editRecord.phoneCheckFlag
                      ? 'success'
                      : 'warning',
                  })}
            >
              {form.getFieldDecorator('phone', {
                initialValue: editRecord.phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
                    }),
                  },
                  {
                    pattern: PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={form.getFieldDecorator('internationalTelCode', {
                    initialValue:
                      editRecord.internationalTelCode || (idd[0] && idd[0].value) || '+86',
                  })(
                    <Select>
                      {map(idd, r => {
                        return (
                          <Select.Option key={r.value} value={r.value}>
                            {r.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          </Col>
          {isCreate && (
            <Col key="password" {...colLayout}>
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                label={intl.get('hiam.subAccount.model.user.password').d('密码')}
              >
                {form.getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.subAccount.model.user.password').d('密码'),
                      }),
                    },
                    {
                      pattern: PASSWORD,
                      message: intl
                        .get('hzero.common.validation.password')
                        .d('至少包含数字/字母/字符2种组合,长度为6-30个字符'),
                    },
                  ],
                })(<Input type="password" />)}
              </Form.Item>
            </Col>
          )}
          {isCreate && (
            <Col key="anotherPassword" {...colLayout}>
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                label={intl.get('hiam.subAccount.model.user.anotherPassword').d('确认密码')}
              >
                {form.getFieldDecorator('anotherPassword', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.subAccount.model.user.anotherPassword').d('确认密码'),
                      }),
                    },
                    {
                      validator: this.validatePasswordRepeat,
                      message: intl
                        .get('hiam.subAccount.view.validation.passwordSame')
                        .d('确认密码必须与密码一致'),
                    },
                  ],
                })(<Input type="password" />)}
              </Form.Item>
            </Col>
          )}
          <Col key="startDateActive" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.startDateActive').d('有效期从')}
            >
              {form.getFieldDecorator('startDateActive', {
                initialValue: editRecord.startDateActive
                  ? moment(editRecord.startDateActive, DEFAULT_DATE_FORMAT)
                  : undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.startDateActive').d('有效期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={currentDate =>
                    form.getFieldValue('endDateActive') &&
                    moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col key="endDateActive" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              key="endDateActive"
              label={intl.get('hiam.subAccount.model.user.endDateActive').d('有效期至')}
            >
              {form.getFieldDecorator('endDateActive', {
                initialValue: editRecord.endDateActive
                  ? moment(editRecord.endDateActive, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder=""
                  disabledDate={currentDate =>
                    form.getFieldValue('startDateActive') &&
                    moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          {isCreate || (
            <Col key="tenant" {...colLayout}>
              <Form.Item
                {...formItemLayout}
                label={intl.get('hiam.subAccount.model.user.tenant').d('所属租户')}
              >
                {form.getFieldDecorator('organizationId', {
                  initialValue: editRecord.organizationId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
                      }),
                    },
                  ],
                })(
                  <Lov code="HPFM.TENANT" textValue={editRecord.tenantName} disabled={!isCreate} />
                )}
              </Form.Item>
            </Col>
          )}
          {isCreate || (
            <Col key="enabled" {...colLayout}>
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                label={intl.get('hiam.subAccount.model.user.enabled').d('冻结')}
              >
                {form.getFieldDecorator('enabled', {
                  initialValue: isUndefined(editRecord.enabled) ? true : editRecord.enabled,
                })(<Switch checkedValue={false} unCheckedValue />)}
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row>{roleNode}</Row>
      </Form>
    );
  }

  render() {
    const { form, editRecord, isCreate, fetchRoles, ...modalProps } = this.props;
    // todo 租户id 明天问下 明伟哥。
    const tenantId = 0;
    const { roleModalProps = {} } = this.state;
    return (
      <Modal
        title={
          isCreate
            ? intl.get('hiam.subAccount.view.message.title.userCreate').d('账号新建')
            : intl.get('hiam.subAccount.view.message.title.userEdit').d('账号编辑')
        }
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={1000}
        closable={false}
        {...modalProps}
        onOk={this.handleEditModalOk}
      >
        {this.renderForm()}
        {roleModalProps.visible && (
          <RoleModal
            {...roleModalProps}
            fetchRoles={fetchRoles}
            onSave={this.handleRoleCreateSave}
            onCancel={this.handleRoleCreateCancel}
            tenantId={tenantId}
          />
        )}
      </Modal>
    );
  }
}
