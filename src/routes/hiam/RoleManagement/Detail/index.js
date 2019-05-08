import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Row, Col, Button, Spin } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import pathParse from 'path-parse';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import { getCodeMeaning, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';
import Drawer from '../Drawer';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const viewTitlePrompt = 'hiam.roleManagement.view.title';
const commonPrompt = 'hzero.common';
const tenantRoleLevel = isTenantRoleLevel();

@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  state = {
    dataSource: {},
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionType, roleId, copyFormId, inheritFormId } = this.props;
    return (
      visible &&
      ((actionType === 'edit' && isNumber(roleId) && roleId !== prevProps.roleId) ||
        (actionType === 'view' && isNumber(roleId) && roleId !== prevProps.roleId) ||
        actionType === 'create' ||
        (actionType === 'copy' && isNumber(copyFormId) && copyFormId !== prevProps.copyFormId) ||
        (actionType === 'inherit' &&
          isNumber(inheritFormId) &&
          inheritFormId !== prevProps.inheritFormId))
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      const { actionType } = this.props;
      if (actionType === 'edit' || actionType === 'view') {
        this.handleFetchDataSource();
      }
    }
  }

  handleFetchDataSource() {
    const { fetchDataSource = e => e, roleId, roleSourceCode } = this.props;
    fetchDataSource(roleId).then(res => {
      if (res) {
        this.setState({
          dataSource: {
            ...res,
            roleSourceMeaning: getCodeMeaning(res.roleSource || 'custom', roleSourceCode),
          },
        });
      }
    });
  }

  getCodeDescription(value, code = []) {
    let result;
    if (value && !isEmpty(code)) {
      const codeList = code.filter(n => n.value === value);
      if (!isEmpty(codeList)) {
        result = codeList[0].description;
      }
    }
    return result;
  }

  handleClose() {
    const { close = e => e } = this.props;
    this.setState({
      dataSource: {},
    });
    close();
  }

  handleSave() {
    const {
      save,
      form: { validateFields = e => e },
      roleId,
    } = this.props;
    const { dataSource = {} } = this.state;
    validateFields((error, values) => {
      if (!isEmpty(error)) {
        return;
      }
      const { description, name, tenantId, _tls } = values;
      const data = {
        ...dataSource,
        description,
        name,
        _tls,
        tenantId:
          VERSION_IS_OP && getCurrentOrganizationId() !== 0
            ? getCurrentOrganizationId()
            : isNumber(tenantId)
            ? tenantId
            : dataSource.tenantId,
      };
      save(roleId, data, this.handleClose.bind(this));
    });
  }

  handleCreate() {
    const {
      actionType,
      create,
      form: { validateFields = e => e },
      inheritFormId,
      roleLevel,
      level,
      parentRoleId,
      copyFormId,
      inherit,
      copy,
    } = this.props;
    const { dataSource = {} } = this.state;
    validateFields((error, values) => {
      if (!isEmpty(error)) {
        return;
      }
      const { code, description, name, tenantId, _tls } = values;
      const codePrefix = this.getCodeDescription(level, roleLevel);
      const data = {
        ...dataSource,
        code: `${codePrefix}${code}`,
        description,
        name,
        tenantId:
          VERSION_IS_OP && getCurrentOrganizationId() !== 0 ? getCurrentOrganizationId() : tenantId,
        parentRoleId,
        level,
        _tls,
        roleSource: 'custom',
        rolePermissionSets: [],
      };
      if (actionType === 'inherit') {
        data.inheritRoleId = inheritFormId;
        inherit(data, this.handleClose.bind(this));
      }
      if (actionType === 'copy') {
        data.copyFromRoleId = copyFormId;
        copy(data, this.handleClose.bind(this));
      }
      if (actionType === 'create') {
        create(data, this.handleClose.bind(this));
      }
    });
  }

  render() {
    const {
      actionType,
      form: { getFieldDecorator },
      organizationId,
      organizationName,
      processing = {},
      visible,
      parentRoleName,
      inheritedRoleName,
    } = this.props;
    const { dataSource = {} } = this.state;
    const {
      name,
      tenantId,
      tenantName,
      viewCode,
      description,
      roleSourceMeaning,
      _token,
    } = dataSource;
    const drawerTitle = {
      view: intl.get(`${viewTitlePrompt}.content.viewRole`, { name }).d(`查看角色“${name}”的明细`),
      edit: intl.get(`${viewTitlePrompt}.content.editRole`, { name }).d(`修改“${name}”`),
      copy: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
      inherit: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
      create: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
    };
    // const contentTitlePrompts = {
    //   view: intl.get(`${viewTitlePrompt}.content.viewRole`, { name }).d(`查看角色“${name}”的明细`),
    //   edit: intl.get(`${viewTitlePrompt}.content.editRole`, { name }).d(`修改“${name}”`),
    //   copy: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
    //   inherit: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
    //   create: intl.get(`${viewTitlePrompt}.createRole`).d('创建角色'),
    // };

    const drawerProps = {
      title: drawerTitle[actionType],
      visible,
      onCancel: this.handleClose.bind(this),
      width: 680,
      anchor: 'right',
      wrapClassName: styles['hiam-role-detail'],
      footer: (
        <Fragment>
          <Button
            onClick={this.handleClose.bind(this)}
            disabled={processing.save || processing.create || false}
          >
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>
          {(actionType === 'create' || actionType === 'copy' || actionType === 'inherit') && (
            <Button
              type="primary"
              loading={processing.create || processing.copy || processing.inherit}
              onClick={this.handleCreate.bind(this)}
            >
              {intl.get(`${commonPrompt}.button.ok`).d('确定')}
            </Button>
          )}
          {actionType === 'edit' && (
            <Button type="primary" loading={processing.save} onClick={this.handleSave.bind(this)}>
              {intl.get(`${commonPrompt}.button.ok`).d('确定')}
            </Button>
          )}
        </Fragment>
      ),
    };
    return (
      <Drawer {...drawerProps}>
        <Spin spinning={processing.query || processing.save || false}>
          <Form className={styles['hiam-role-detail-form']}>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.parentRole`).d('上级角色')}
                  {...formLayout}
                >
                  {getFieldDecorator('parentRoleName', {
                    initialValue: parentRoleName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.inheritedRole`).d('继承自')}
                  {...formLayout}
                >
                  {getFieldDecorator('inheritedRoleName', {
                    initialValue:
                      actionType === 'inherit' ? inheritedRoleName : dataSource.inheritedRoleName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label={intl.get(`${modelPrompt}.code`).d('角色编码')} {...formLayout}>
                  {getFieldDecorator('code', {
                    initialValue: pathParse(viewCode || '').base,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, {
                            name: intl.get(`${modelPrompt}.code`).d('角色编码'),
                          })
                          .d(`请输入${intl.get(`${modelPrompt}.code`).d('角色编码')}`),
                      },
                      {
                        max: 64,
                        message: intl
                          .get(`${commonPrompt}.validation.max`, {
                            max: 64,
                          })
                          .d(`长度不能超过${64}个字符`),
                      },
                    ],
                  })(
                    <Input
                      inputChinese={false}
                      disabled={actionType === 'view' || actionType === 'edit'}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label={intl.get(`${modelPrompt}.name`).d('角色名称')} {...formLayout}>
                  {getFieldDecorator('name', {
                    initialValue: name,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, {
                            name: intl.get(`${modelPrompt}.name`).d('角色名称'),
                          })
                          .d(`请输入${intl.get(`${modelPrompt}.name`).d('角色名称')}`),
                      },
                      {
                        max: 64,
                        message: intl
                          .get(`${commonPrompt}.validation.max`, {
                            max: 64,
                          })
                          .d(`长度不能超过${64}个字符`),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get(`${viewTitlePrompt}.name`).d('角色名称')}
                      field="name"
                      inputSize={{ zh: 64, en: 64 }}
                      // eslint-disable-next-line
                      token={_token}
                      disabled={actionType === 'view'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.roleSource`).d('角色来源')}
                  {...formLayout}
                >
                  {getFieldDecorator('roleSourceMeaning', {
                    initialValue: roleSourceMeaning,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              {/* { (!VERSION_IS_OP || (VERSION_IS_OP && organizationId === 0)) && ( */}
              {!VERSION_IS_OP && (
                <Col span={12}>
                  <FormItem label={intl.get(`${modelPrompt}.tenant`).d('所属租户')} {...formLayout}>
                    {getFieldDecorator('tenantId', {
                      initialValue:
                        organizationId !== 0
                          ? organizationId
                          : isNumber(tenantId)
                          ? tenantId
                          : organizationId,
                    })(
                      <Lov
                        disabled={
                          actionType === 'view' || actionType === 'edit' || organizationId !== 0
                        }
                        textValue={
                          organizationId !== 0
                            ? organizationName
                            : isNumber(tenantId)
                            ? tenantName
                            : organizationName
                        }
                        code={tenantRoleLevel ? 'HPFM.TENANT.ORG' : 'HPFM.TENANT'}
                      />
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  className="description"
                  label={intl.get(`${modelPrompt}.description`).d('角色描述')}
                  {...formLayout}
                  labelCol={{ span: 3 }}
                >
                  {getFieldDecorator('description', {
                    initialValue: description,
                    rules: [
                      {
                        max: 240,
                        message: intl
                          .get(`${commonPrompt}.validation.max`, {
                            max: 240,
                          })
                          .d(`长度不能超过${240}个字符`),
                      },
                    ],
                  })(<TextArea autosize disabled={actionType === 'view'} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Drawer>
    );
  }
}
