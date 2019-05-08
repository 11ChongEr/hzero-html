/**
 * EditForm - 子账户管理 - 帐号编辑表单
 * @date 2018/11/13
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import { forEach, isEmpty, map, isNumber, join, omit, isUndefined, isNil, filter } from 'lodash';
import {
  Form,
  Input,
  Checkbox,
  Switch,
  DatePicker,
  Table,
  Row,
  Col,
  Button,
  Modal,
  Select,
} from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import { EMAIL, PHONE, PASSWORD } from 'utils/regExp';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { VERSION_IS_OP } from 'utils/config';
import {
  getDateFormat,
  addItemsToPagination,
  createPagination,
  delItemsToPagination,
  tableScrollWidth,
} from 'utils/utils';

import RoleModal from './RoleModal';

import styles from '../../index.less';

const FormItem = Form.Item;
const { Option } = Select;

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

/**
 * EditForm-编辑子账户信息
 * @reactProps {Function} fetchUserRoles 获取当前编辑用户已分配的角色
 * @reactProps {Object[]} dataSource 编辑用户已分配的角色
 * @reactProps {Object[]} LEVEL 资源层级的值集
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.cancelDefaultParams = new Set();
  }

  static propTypes = {
    fetchUserRoles: PropTypes.func.isRequired,
    dataSource: PropTypes.array,
    level: PropTypes.array,
  };

  static defaultProps = {
    dataSource: [],
    level: [],
  };

  state = {
    dataSource: [],
    pagination: false,
    roleTableFetchLoading: false,
    level: [],
    selectedRowKeys: [],
    levelMap: {},
    visible: false,
    // 选择组织的框是否显示
  };

  /**
   * @param {Object} nextProps 下一个属性
   * @param {Object} prevState 上一个状态
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {};
    const { level, isCreate } = nextProps;
    if (isCreate && prevState.pagination !== false) {
      // 新建分页没有 分页
      nextState.pagination = false;
    }
    if (level !== prevState.level) {
      nextState.level = level;
      nextState.levelMap = {};
      forEach(level, l => {
        nextState.levelMap[l.value] = l;
      });
    }
    return nextState;
  }

  /**
   * 将 hook 方法传递出去
   */
  componentDidMount() {
    this.init();
  }

  /**
   * 初始化数据
   * 编辑 + 加载用户角色
   * 重置form表单
   */
  init() {
    const { form, isCreate } = this.props;
    form.resetFields();
    this.cancelDefaultParams.clear();
    if (!isCreate) {
      // 在当前是编辑时
      this.handleRoleTableChange();
    }
  }

  /**
   * 检查 确认密码是否与密码一致
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validatePasswordRepeat(rule, value, callback) {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(
        intl.get('hiam.subAccount.view.validation.passwordSame').d('确认密码必须与密码一致')
      );
    } else {
      callback();
    }
  }

  /**
   * 检查 有效日期至 大于 有效日期从
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validateEndDateActive(rule, value, callback) {
    const { form } = this.props;
    // startDateActive 已经保证会有值
    if (value && !value.isAfter(form.getFieldValue('startDateActive'), 'day')) {
      callback(
        intl.get('hiam.subAccount.view.validation.timeRange').d('有效日期至必须大于有效日期从')
      );
    } else {
      callback();
    }
  }

  /**
   * 获取编辑完成的数据
   */
  @Bind()
  getEditFormData() {
    const { form, initialValue, isCreate, organizationId } = this.props;
    const { dataSource } = this.state;
    let result = {};
    const validateFields = ['realName', 'email', 'phone', 'startDateActive', 'endDateActive'];
    if (isCreate) {
      validateFields.push('password');
      validateFields.push('anotherPassword');
    } else {
      validateFields.push('enabled');
    }
    form.validateFields((err, values) => {
      if (!err) {
        const excludeArray = [];
        const memberRoleList = [];
        const defaultRoleIds = [];
        forEach(dataSource, record => {
          const omitRecord = omit(record, [
            '_assignLevelValue',
            '_assignLevelValueMeaning',
            'defaultRoleIdUpdate',
          ]);
          const newRecord = {
            ...omitRecord, // 需要 _token 等字段
            roleId: record.id,
            assignLevel: VERSION_IS_OP
              ? // OP 模式下 选了的话 就是 选择的值 org, 没选 就是 租户
                record.assignLevel
                ? record.assignLevel
                : 'organization'
              : record.assignLevel,
            assignLevelValue: VERSION_IS_OP
              ? // OP 模式下 选了的话 就是 选择的值 对应的组织, 没选 就是 角色的租户
                record.assignLevel
                ? record.assignLevelValue
                : record.parentRoleAssignLevelValue
              : record.assignLevelValue,
            memberType: record.memberType,
            sourceId: organizationId,
            sourceType: record.sourceType,
          };
          // (VERSION_IS_OP && getCurrentOrganizationId() !== 0)
          // // 只有填写 分配层级 与 分配层级值 的角色才可以保存
          // switch (newRecord.assignLevel) {
          //   case 'org':
          //     newRecord.assignLevelValue = record.assignLevelValue;
          //     break;
          //   case 'organization':
          //   case 'site':
          //     // 如果是别人分配的 就不能修改
          //     newRecord.assignLevelValue = record.assignLevelValue || organizationId;
          //     break;
          //   default:
          //     break;
          // }
          // 由于这种写法 判断不了 哪些数据没有更新 所以全部保存
          if (!isEmpty(newRecord.assignLevel) && isNumber(newRecord.assignLevelValue)) {
            memberRoleList.push(newRecord);
          }
          if (!isUndefined(record.defaultRoleId)) {
            defaultRoleIds.push(record.defaultRoleId);
          }
          excludeArray.push(`assignLevel#${record.id}`, `assignLevelValue#${record.id}`);
        });
        const { birthday, startDateActive, endDateActive, ...data } = omit(values, excludeArray);
        const cancelDefaultParams = [...this.cancelDefaultParams.values()].filter(tId => {
          // 判断取消的租户 是否又勾选了
          return !memberRoleList.some(r => {
            return (
              r.assignLevel === 'organization' &&
              r.assignLevelValue === tId &&
              !isUndefined(r.defaultRoleId)
            );
          });
        });
        result = {
          ...initialValue,
          ...data,
          startDateActive: startDateActive
            ? startDateActive.format(DEFAULT_DATE_FORMAT)
            : undefined,
          endDateActive: endDateActive ? endDateActive.format(DEFAULT_DATE_FORMAT) : undefined,
          birthday: birthday ? birthday.format(DEFAULT_DATE_FORMAT) : undefined,
          defaultRoleIds,
          memberRoleList,
          organizationId,
          cancelDefaultParams,
        };
      }
    });
    return result;
  }

  /**
   * 新增角色模态框确认按钮点击
   */
  @Bind()
  handleRoleAddSaveBtnClick(roles) {
    const { isCreate = true } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    this.setState({
      dataSource: [
        ...map(roles, r => {
          const newRecord = {
            ...r,
            memberType: 'user',
            sourceType: r.level,
            _assignLevelValue: r.tenantId,
            _assignLevelValueMeaning: r.tenantName,
            isNew: true,
          };
          return newRecord;
        }),
        ...dataSource,
      ],
      pagination: isCreate
        ? false
        : addItemsToPagination(roles.length, dataSource.length, pagination),
      visible: false,
    });
    return Promise.resolve();
  }

  /**
   * 新增角色模态框取消按钮点击
   */
  @Bind()
  handleRoleAddCancelBtnClick() {
    this.setState({
      visible: false,
    });
  }

  /**
   * 打开新增角色 选择模态框
   */
  @Bind()
  handleRoleAddBtnClick() {
    // if (isEmpty(noAllocRoles)) {
    //   Modal.warn({
    //     content: intl
    //       .get('hiam.subAccount.view.message.noEnoughRole')
    //       .d('可分配的角色已全部分配完毕'),
    //   });
    //   return;
    // }
    const { isCreate, initialValue = {} } = this.props;
    const { dataSource = [] } = this.state;
    const roleModalProps = {
      excludeRoleIds: [],
      excludeUserIds: [],
    };
    if (!isCreate) {
      roleModalProps.excludeUserIds.push(initialValue.id);
    }
    dataSource.forEach(r => {
      if (r.isNew) {
        roleModalProps.excludeRoleIds.push(r.id);
      }
    });
    this.setState({
      visible: true,
      roleModalProps,
    });
  }

  @Bind()
  fetchRoles(fields) {
    const { fetchAllRoles } = this.props;
    return fetchAllRoles(fields);
  }

  /**
   * @param {String[]} selectedRowKeys 选中的rowKey
   */
  @Bind()
  handleRoleSelectionChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 删除选中的角色
   * 由于 租户级这边 删除后 是重新查询, 所以 不需要保存之前的 分页信息
   */
  @Bind()
  handleRoleRemoveBtnClick() {
    const { deleteRoles, initialValue, isCreate = true } = this.props;
    const { dataSource, selectedRowKeys, pagination } = this.state;
    const that = this;
    if (selectedRowKeys.length === 0) {
      Modal.error({
        content: intl.get('hiam.subAccount.view.message.chooseRoleFirst').d('请先选择要删除的角色'),
      });
      return;
    }
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示框?'),
      content: intl.get(`hiam.subAccount.view.message.title.content`).d('确定删除吗？'),
      onOk() {
        const ids = [];
        const newDataSource = [];
        dataSource.forEach(item => {
          if (!item.isNew && selectedRowKeys.indexOf(item.id) >= 0) {
            ids.push({
              roleId: item.id,
              memberId: initialValue.id,
            });
          }
          if (!(item.isNew && selectedRowKeys.indexOf(item.id) >= 0)) {
            newDataSource.push(item);
          }
        });
        if (ids.length > 0) {
          deleteRoles(ids).then(() => {
            that.setState({
              dataSource: newDataSource,
              selectedRowKeys: [],
              // pagination: isCreate ? false: delItemsToPagination(selectedRowKeys.length, dataSource.length, pagination),
            });
            that.handleRoleTableChange();
            notification.success();
          });
        } else {
          that.setState({
            dataSource: newDataSource,
            selectedRowKeys: [],
            pagination: isCreate
              ? false
              : delItemsToPagination(selectedRowKeys.length, dataSource.length, pagination),
          });
          notification.success();
        }
      },
    });
  }

  /**
   * 渲染当前记录可选择的层级
   * 只能选择 组织层 和 租户层 且 层级小于等于 当前角色层级
   * @param {Object} record 当前记录
   */
  @Bind()
  getRoleCurrentRecordLevelOptions(record) {
    const { level, levelMap } = this.state;
    if (VERSION_IS_OP) {
      // 当时 OP 版本的时候
      return filter(level, l => l.value === 'org').map(l => {
        return (
          <Option value={l.value} key={l.value}>
            {l.meaning}
          </Option>
        );
      });
    }
    // const { isCreate } = this.props;
    const $Options = [];
    const currentRole = record;
    if (!isEmpty(currentRole)) {
      // String 是 编辑后的, Number 是用户之前拥有的
      forEach(level, l => {
        if (l.value !== 'site' && +l.tag >= +levelMap[currentRole.parentRoleAssignLevel].tag) {
          $Options.push(
            <Option value={l.value} key={l.value}>
              {l.meaning}
            </Option>
          );
        }
      });
    }
    if ($Options.length === 0) {
      const levelItem = levelMap[record.assignLevel];
      if (levelItem) {
        $Options.push(
          <Option value={levelItem.value} key={levelItem.value}>
            {levelItem.meaning}
          </Option>
        );
      }
    }
    return $Options;
  }

  /**
   * 分配角色 层级改变
   * @param {string} levelValue 层级的value
   * @param {Object} updateRecord 当前的记录
   */
  @Bind()
  handleRoleLevelRecordChange(levelValue, updateRecord) {
    const { dataSource, levelMap } = this.state;
    const changeLevel = levelMap[levelValue];
    if (!isEmpty(changeLevel)) {
      this.setState({
        dataSource: map(dataSource, record => {
          if (record.id === updateRecord.id) {
            const isChangeToOrganization = changeLevel.value === 'organization';
            const isChangeFromOrganization = updateRecord.assignLevel === 'organization';
            if (isChangeFromOrganization) {
              if (!isUndefined(updateRecord.defaultRoleId)) {
                this.cancelDefaultParams.add(updateRecord.assignLevelValue);
              }
            }
            return {
              ...updateRecord,
              assignLevel: changeLevel.value,
              // 切换到 组织层 去掉 defaultRoleId
              defaultRoleId: isChangeToOrganization ? undefined : updateRecord.defaultRoleId,
              // 去掉在组织层级上的数据, 防止副作用
              // 转变到 租户层 需要得到上一个的数据 从 租户层 转变到 其他层 需要存储租户层的数据
              // tenantId 和 tenantName 是 后端查询出来的 角色 的 租户id 和 租户名称
              assignLevelValue: isChangeToOrganization
                ? updateRecord._assignLevelValue || updateRecord.tenantId
                : undefined,
              assignLevelValueMeaning: isChangeToOrganization
                ? updateRecord._assignLevelValueMeaning || updateRecord.tenantName
                : undefined,
              _assignLevelValue: isChangeFromOrganization
                ? updateRecord.assignLevelValue
                : updateRecord._assignLevelValue,
              _assignLevelValueMeaning: isChangeFromOrganization
                ? updateRecord.assignLevelValueMeaning
                : updateRecord._assignLevelValueMeaning,
            };
          } else {
            return record;
          }
        }),
      });
    }
  }

  /**
   * 分配角色 层级值改变
   * @param {Number} assignLevelValue 层级的value
   * @param {Object} updateRecord 当前的记录
   */
  @Bind()
  handleAssignLevelValueChange(assignLevelValue, updateRecord) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: map(dataSource, record => {
        if (record.id === updateRecord.id) {
          return {
            ...updateRecord,
            assignLevelValue,
            // 去掉在组织层级上的数据, 防止副作用
            assignLevelValueMeaning: undefined,
          };
        } else {
          return record;
        }
      }),
    });
  }

  /**
   * 默认角色改变
   * @param {object} record 默认角色 改变
   */
  handleRoleDefaultChange(record) {
    let nextDefaultRoleId = record.id;
    if (!isUndefined(record.defaultRoleId)) {
      // 已经是 默认角色了 什么都不做 则取消默认角色并将该租户加入 删除角色租户中
      this.cancelDefaultParams.add(record.assignLevelValue);
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
        return newRole;
        // {
        //   ...newRole,
        //   // defaultRoleIdUpdate: true,
        // };
      } else {
        return item;
      }
    });
    this.setState({
      dataSource: newDataSource,
    });
  }

  /**
   * 角色 table 分页改变
   * 如果是新增用户 分页是
   * @param {?object} page
   * @param {?object} filter
   * @param {?object} sort
   */
  @Bind()
  handleRoleTableChange(page, _, sort) {
    const { fetchUserRoles, isCreate = true, initialValue = {} } = this.props;
    if (!isCreate) {
      this.showRoleTableLoading();
      fetchUserRoles({ page, sort, userId: initialValue.id })
        .then(roleContent => {
          // 在前面中已经 getResponse 了
          if (roleContent) {
            this.setState({
              dataSource: roleContent.content || [],
              pagination: createPagination(roleContent),
            });
            // 翻页清空 已取消默认角色的租户
            this.cancelDefaultParams.clear();
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

  @Bind()
  changeCountryId() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ regionId: undefined });
  }

  /**
   * 渲染新增表单
   */
  renderCreateForm() {
    const { form } = this.props;
    const dateFormat = getDateFormat();
    const { idd = [], gender = [] } = this.props;
    return (
      <React.Fragment>
        <Row type="flex">
          <Col {...colLayout}>
            <FormItem
              required
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {form.getFieldDecorator('realName', {
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
            </FormItem>
          </Col>
          <Col key="birthday" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              key="birthday"
              label={intl.get('hiam.subAccount.model.user.birthday').d('出生日期')}
            >
              {form.getFieldDecorator('birthday', {})(
                <DatePicker format={dateFormat} style={{ width: '100%' }} placeholder="" />
              )}
            </Form.Item>
          </Col>
          <Col key="nickname" {...colLayout}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.nickname').d('昵称')}
            >
              {form.getFieldDecorator('nickname', {
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
              {form.getFieldDecorator('gender', {})(
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
              {form.getFieldDecorator('countryId', {})(
                <Lov
                  code="HPFM.COUNTRY"
                  onChange={this.changeCountryId}
                  // textValue={initialValue.countryName}
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
              {form.getFieldDecorator('regionId', {})(
                <Lov
                  code="HPFM.REGION"
                  queryParams={{
                    countryId: form.getFieldValue('countryId'),
                  }}
                  // textValue={initialValue.regionName}
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

          <Col {...colLayout}>
            <FormItem
              required
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {form.getFieldDecorator('email', {
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
            </FormItem>
          </Col>
          <Col {...colLayout}>
            <FormItem
              required
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            >
              {form.getFieldDecorator('phone', {
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
                    initialValue: (idd[0] && idd[0].value) || '+86',
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
            </FormItem>
          </Col>
          <Col {...colLayout}>
            <FormItem
              required
              {...formItemLayout}
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
            </FormItem>
          </Col>
          <Col {...colLayout}>
            <FormItem required {...formItemLayout} label="确认密码">
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
                  },
                ],
              })(<Input type="password" />)}
            </FormItem>
          </Col>
          <Col {...colLayout}>
            <FormItem
              required
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.startDateActive').d('有效日期从')}
            >
              {form.getFieldDecorator('startDateActive', {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.startDateActive').d('有效日期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  allowClear={false}
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={currentDate =>
                    form.getFieldValue('endDateActive') &&
                    moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col {...colLayout}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.endDateActive').d('有效日期至')}
            >
              {form.getFieldDecorator('endDateActive', {
                rules: [
                  {
                    type: 'object',
                    validator: this.validateEndDateActive,
                  },
                ],
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={currentDate =>
                    form.getFieldValue('startDateActive') &&
                    moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  /**
   * 渲染编辑表单
   */
  renderEditForm() {
    const { form, initialValue = {} } = this.props;
    const { idd = [], gender = [] } = this.props;
    const emailError = form.getFieldError('email');
    const sameEmail = initialValue.email === form.getFieldValue('email');
    const phoneError = form.getFieldError('phone');
    const samePhone = initialValue.phone === form.getFieldValue('phone');
    const dateFormat = getDateFormat();
    return (
      <Row>
        <Col {...colLayout}>
          <FormItem
            required
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.loginName').d('账号')}
          >
            {form.getFieldDecorator('loginName', { initialValue: initialValue.loginName })(
              <Input disabled />
            )}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem
            required
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
          >
            {form.getFieldDecorator('realName', {
              initialValue: initialValue.realName,
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
          </FormItem>
        </Col>
        <Col key="birthday" {...colLayout}>
          <Form.Item
            {...formItemLayout}
            key="birthday"
            label={intl.get('hiam.subAccount.model.user.birthday').d('出生日期')}
          >
            {form.getFieldDecorator('birthday', {
              initialValue: initialValue.birthday
                ? moment(initialValue.birthday, DEFAULT_DATE_FORMAT)
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
              initialValue: initialValue.nickname,
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
              initialValue: isUndefined(initialValue.gender) ? '' : `${initialValue.gender}`,
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
              initialValue: initialValue.countryId,
            })(
              <Lov
                code="HPFM.COUNTRY"
                onChange={this.changeCountryId}
                textValue={initialValue.countryName}
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
              initialValue: initialValue.organizationId,
            })(
              <Lov
                code="HPFM.REGION"
                queryParams={{
                  countryId: form.getFieldValue('countryId'),
                }}
                textValue={initialValue.regionName}
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
              initialValue: initialValue.addressDetail,
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
        <Col {...colLayout}>
          <FormItem
            required
            {...formItemLayout}
            hasFeedback
            help={
              emailError
                ? join(emailError)
                : initialValue.emailCheckFlag
                ? ''
                : intl.get('hiam.subAccount.view.validation.emailNotCheck').d('邮箱未验证')
            }
            validateStatus={
              emailError
                ? 'error'
                : sameEmail && initialValue.emailCheckFlag
                ? 'success'
                : 'warning'
            }
            label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
          >
            {form.getFieldDecorator('email', {
              initialValue: initialValue.email,
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
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem
            required
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            hasFeedback
            help={
              phoneError
                ? join(phoneError)
                : initialValue.phoneCheckFlag
                ? ''
                : intl.get('hiam.subAccount.view.validation.phoneNotCheck').d('手机号码未验证')
            }
            validateStatus={
              phoneError
                ? 'error'
                : samePhone && initialValue.phoneCheckFlag
                ? 'success'
                : 'warning'
            }
          >
            {form.getFieldDecorator('phone', {
              initialValue: initialValue.phone,
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
                  initialValue: initialValue.internationalTelCode || idd[0] || '+86',
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
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem
            required
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.startDateActive').d('有效日期从')}
          >
            {form.getFieldDecorator('startDateActive', {
              initialValue: initialValue.startDateActive && moment(initialValue.startDateActive),
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.subAccount.model.user.startDateActive').d('有效日期从'),
                  }),
                },
              ],
            })(
              <DatePicker
                allowClear={false}
                format={dateFormat}
                style={{ width: '100%' }}
                placeholder={null}
                disabledDate={currentDate =>
                  form.getFieldValue('endDateActive') &&
                  moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                }
              />
            )}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.endDateActive').d('有效日期至')}
          >
            {form.getFieldDecorator('endDateActive', {
              initialValue: initialValue.endDateActive && moment(initialValue.endDateActive),
            })(
              <DatePicker
                format={dateFormat}
                style={{ width: '100%' }}
                placeholder={null}
                disabledDate={currentDate =>
                  form.getFieldValue('startDateActive') &&
                  moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                }
              />
            )}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem
            {...formItemLayout}
            label={intl.get('hiam.subAccount.model.user.enabled').d('冻结')}
          >
            {form.getFieldDecorator('enabled', {
              initialValue: !!initialValue.enabled,
            })(<Switch checkedValue={false} unCheckedValue />)}
          </FormItem>
        </Col>
      </Row>
    );
  }

  /**
   * 渲染表单
   * 根据 isCreate 选择 渲染不同的表单
   * @return
   */
  @Bind()
  renderForm() {
    const { isCreate } = this.props;
    if (isCreate) {
      return this.renderCreateForm();
    } else {
      return this.renderEditForm();
    }
  }

  /**
   * 渲染 分配角色Table
   */
  @Bind()
  renderRoleTable() {
    const {
      dataSource = [],
      selectedRowKeys = [],
      levelMap,
      roleTableFetchLoading,
      pagination = false,
    } = this.state;
    const {
      isSameUser,
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const rowSelection = isSameUser
      ? null
      : {
          selectedRowKeys,
          onChange: this.handleRoleSelectionChange,
        };
    const columns = VERSION_IS_OP
      ? [
          {
            title: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
            dataIndex: 'name',
            width: 120,
          },
          // OP 版本需要 分配层级 和 分配层级值
          // 分配层级非必输, 当 分配层级选择以后 分配层级集 必输

          {
            title: intl.get('hiam.subAccount.model.role.assignLevel').d('分配层级'),
            dataIndex: 'assignLevel',
            width: 100,
            render: (item, record) => {
              // 将 item 转换为 string, Select 需要
              if (isSameUser) {
                return levelMap[item] && levelMap[item].meaning;
              } else {
                return (
                  <Form.Item>
                    {getFieldDecorator(`assignLevel#${record.id}`, {
                      rules: [
                        {
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hiam.subAccount.model.role.assignLevel').d('分配层级'),
                          }),
                        },
                      ],
                      initialValue:
                        VERSION_IS_OP &&
                        (getFieldValue(`assignLevel#${record.id}`) || item) === 'organization'
                          ? undefined
                          : item,
                    })(
                      <Select
                        style={{ width: '100%' }}
                        onChange={levelValue => {
                          this.handleRoleLevelRecordChange(levelValue, record);
                        }}
                      >
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
              if (record.assignLevel) {
                if (record.assignLevel === 'site' || record.assignLevel === 'organization') {
                  // 当是第一次进来编辑的时候 使用上一次的tenantName 否则使用选中角色的租户名称
                  if (
                    VERSION_IS_OP &&
                    (getFieldValue(`assignLevel#${record.id}`) || record.assignLevel) ===
                      'organization'
                  ) {
                    return '';
                  }
                  return record.assignLevelValueMeaning;
                } else if (record.assignLevel === 'org') {
                  if (isSameUser) {
                    return record.assignLevelValueMeaning;
                  } else {
                    // 选择组织
                    return (
                      <Form.Item>
                        {getFieldDecorator(`assignLevelValue#${record.id}`, {
                          rules: [
                            {
                              required: !isNil(getFieldDecorator(`assignLevelValue#${record.id}`)),
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hiam.subAccount.model.role.assignLevelValue')
                                  .d('分配层级值'),
                              }),
                            },
                          ],
                          initialValue: item,
                        })(
                          <Lov
                            code="HIAM.ASSIGN_LEVEL_VALUE_ORG"
                            queryParams={{ roleId: record.id }}
                            textValue={record.assignLevelValueMeaning}
                            onChange={assignLevelValue =>
                              this.handleAssignLevelValueChange(assignLevelValue, record)
                            }
                          />
                        )}
                      </Form.Item>
                    );
                  }
                }
              } else {
                // 如果没有选中分配层级, 则不可改变
                return '';
              }
            },
          },
          {
            title: intl.get('hiam.subAccount.model.role.defaultRoleId').d('默认'),
            key: 'defaultRole',
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
        ]
      : [
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
              // 将 item 转换为 string, Select 需要
              if (isSameUser) {
                return levelMap[item] && levelMap[item].meaning;
              } else {
                return (
                  <Form.Item>
                    {getFieldDecorator(`assignLevel#${record.id}`, {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hiam.subAccount.model.role.assignLevel').d('分配层级'),
                          }),
                        },
                      ],
                      initialValue: item,
                    })(
                      <Select
                        style={{ width: '100%' }}
                        onChange={levelValue => {
                          this.handleRoleLevelRecordChange(levelValue, record);
                        }}
                      >
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
              if (record.assignLevel) {
                if (record.assignLevel === 'site' || record.assignLevel === 'organization') {
                  // 当是第一次进来编辑的时候 使用上一次的tenantName 否则使用选中角色的租户名称
                  return record.assignLevelValueMeaning;
                } else if (record.assignLevel === 'org') {
                  if (isSameUser) {
                    return record.assignLevelValueMeaning;
                  } else {
                    // 选择组织
                    return (
                      <Form.Item>
                        {getFieldDecorator(`assignLevelValue#${record.id}`, {
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
                          initialValue: item,
                        })(
                          <Lov
                            code="HIAM.ASSIGN_LEVEL_VALUE_ORG"
                            queryParams={{ roleId: record.id }}
                            textValue={record.assignLevelValueMeaning}
                            onChange={assignLevelValue =>
                              this.handleAssignLevelValueChange(assignLevelValue, record)
                            }
                          />
                        )}
                      </Form.Item>
                    );
                  }
                }
              } else {
                // 如果没有选中分配层级, 则不可改变
                return '';
              }
            },
          },
          {
            title: intl.get('hiam.subAccount.model.role.defaultRoleId').d('默认'),
            key: 'defaultRole',
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
    return (
      <Table
        bordered
        rowKey="id"
        onChange={this.handleRoleTableChange}
        loading={roleTableFetchLoading}
        rowSelection={rowSelection}
        dataSource={dataSource}
        pagination={pagination}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }

  render() {
    const { selectedRowKeys, visible, roleModalProps = {} } = this.state;
    const { isSameUser, loadingDistributeUsers } = this.props;
    return (
      <React.Fragment>
        <Form>
          {this.renderForm()}
          {isSameUser ? (
            <Row>
              <Col>
                <FormItem
                  label={intl.get('hiam.subAccount.view.message.title.role').d('角色')}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 20 }}
                  className={styles['rule-table']}
                >
                  {this.renderRoleTable()}
                </FormItem>
              </Col>
            </Row>
          ) : (
            <React.Fragment>
              <Row>
                <Col>
                  <FormItem
                    label={intl.get('hiam.subAccount.view.message.title.role').d('角色')}
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
              <Row type="flex">
                <Col span={3} />
                <Col span={20} className={styles['rule-table']}>
                  {this.renderRoleTable()}
                </Col>
              </Row>
            </React.Fragment>
          )}
        </Form>
        {!!visible && (
          <RoleModal
            {...roleModalProps}
            visible={visible}
            loading={loadingDistributeUsers}
            fetchRoles={this.fetchRoles}
            onSave={this.handleRoleAddSaveBtnClick}
            onCancel={this.handleRoleAddCancelBtnClick}
          />
        )}
      </React.Fragment>
    );
  }
}
