import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Switch, Select, InputNumber, Button, Icon, Popover } from 'hzero-ui';
import { isEmpty, toSafeInteger } from 'lodash';
import TLEditor from 'components/TLEditor';
import LazyLoadMenuIcon from 'components/LazyLoadMenuIcon';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import ParentDirInput from './ParentDirInput';
import DirModal from './DirModal';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const viewButtonPrompt = 'hiam.menuConfig.view.button';
const viewMessagePrompt = 'hiam.menuConfig.view.message';
const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';
const tenantRoleLevel = isTenantRoleLevel();

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  constructor(props) {
    super(props);
    this.getMenuType = this.getMenuType.bind(this);
  }

  state = {
    dirModelDataSource: [],
    dirPagination: {},
    dirModelVisible: false,
    currentParentDir: {},
  };

  codeValidator(rule, value, callback) {
    const {
      handleCheckMenuDirExists = e => e,
      // codePrefix,
      organizationId,
      form: { getFieldsValue = e => e },
    } = this.props;
    const { level, type, codePrefix } = getFieldsValue();
    handleCheckMenuDirExists({
      code: `${codePrefix}.${value}`,
      level,
      type,
      tenantId: organizationId,
    }).then(res => {
      if (res && res.failed) {
        callback(res.message);
      }
      callback();
    });
  }

  codePrefixValidator() {
    this.props.form.validateFields(['code'], { force: true });
  }

  parentDirValidator(rule, value, callback) {
    const {
      form: { getFieldValue = e => e },
    } = this.props;
    if (!tenantRoleLevel && isEmpty(getFieldValue('level'))) {
      callback(intl.get(`${viewMessagePrompt}.error.levelIsRequired`).d('层级不能为空'));
    }
    callback();
  }

  onDirModalOk(record) {
    const {
      form: { setFieldsValue = e => e },
    } = this.props;
    this.setState({
      currentParentDir: record,
    });
    setFieldsValue({ parentId: record.id });
  }

  openDirModal() {
    const {
      form: { getFieldValue = e => e },
    } = this.props;
    const params = tenantRoleLevel
      ? { size: 10, page: 0 }
      : { size: 10, page: 0, level: getFieldValue('level') };
    this.handleSearch(params);
    // handleQueryDir({
    //   size: 10,
    //   page: 0,
    //   level: getFieldValue('level') }, dirModelDataSource => {
    //     const { dataSource, pagination } = dirModelDataSource;
    //     this.setState({
    //       dirModelDataSource: dataSource,
    //       dirPagination: pagination,
    //     });
    // });
    this.setState({
      dirModelVisible: true,
    });
  }

  closeDirModal() {
    this.setState({
      dirModelVisible: false,
    });
  }

  getMenuType() {
    return [
      {
        value: 'menu',
        title: intl.get(`${viewMessagePrompt}.menu.menu`).d('菜单'),
      },
      {
        value: 'dir',
        title: intl.get(`${viewMessagePrompt}.menu.dir`).d('目录'),
      },
      {
        value: 'root',
        title: intl.get(`${viewMessagePrompt}.menu.root`).d('预置目录'),
      },
    ];
  }

  onLevelChange() {
    const {
      form: { setFields = e => e },
      handleSetDataSource = e => e,
    } = this.props;
    setFields({
      parentId: { value: undefined, error: undefined },
    });

    this.setState({
      currentParentDir: {},
    });
    handleSetDataSource({ permissions: [], parentId: null, parentName: null });
  }

  onTypeChange(type) {
    const {
      form: { setFields = e => e },
      handleSetDataSource = e => e,
    } = this.props;
    setFields({
      dir: { error: undefined },
      code: { value: undefined, error: undefined },
      name: { value: undefined, error: undefined },
      parentId: { value: undefined, error: undefined },
      route: { value: undefined, error: undefined },
    });
    this.setState({
      currentParentDir: {},
    });
    handleSetDataSource({ type, permissions: [], parentName: null });
  }

  parserSort(value) {
    return toSafeInteger(value);
  }

  handleSearch(params) {
    const {
      handleQueryDir = e => e,
      form: { getFieldValue = e => e },
    } = this.props;
    const fields = tenantRoleLevel
      ? { size: 10, page: 0 }
      : { size: 10, page: 0, level: getFieldValue('level') };
    handleQueryDir({ ...fields, ...params }, dirModelDataSource => {
      const { dataSource, pagination } = dirModelDataSource;
      this.setState({
        dirModelDataSource: dataSource,
        dirPagination: pagination,
      });
    });
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue = e => e, getFieldsValue = e => e },
      // codePrefix,
      levelCode = [],
      editable,
      handleOpenIconModal = e => e,
      dataSource = {},
      dirModalLoading = false,
      menuPrefixList = [],
      menuTypeList = [],
    } = this.props;
    const {
      dirModelVisible,
      currentParentDir,
      dirModelDataSource = [],
      dirPagination = {},
    } = this.state;
    const {
      code = '',
      // enabledFlag = true,
      description,
      icon,
      parentId,
      name,
      level,
      parentName,
      type = 'dir',
      quickIndex,
      route,
      sort,
      virtualFlag = 0,
      _token,
    } = dataSource;
    const dirModalProps = {
      getFieldsValue,
      visible: dirModelVisible,
      onOk: this.onDirModalOk.bind(this),
      onCancel: this.closeDirModal.bind(this),
      dataSource: dirModelDataSource,
      pagination: dirPagination,
      defaultSelectedRow: { id: getFieldValue('parentId'), name: currentParentDir.name },
      handleSearch: this.handleSearch.bind(this),
      loading: dirModalLoading,
    };

    const selectBefore = getFieldDecorator('codePrefix', {
      initialValue: (menuPrefixList.length > 0 && menuPrefixList[0].value) || '',
      // validateTrigger: 'onSelect',
      rules: [{ validator: this.codePrefixValidator.bind(this) }],
      // validateFirst: true,
    })(
      <Select style={{ width: 80 }}>
        {menuPrefixList.map(n => (
          <Select.Option key={n.value} value={n.value}>
            {n.meaning}.
          </Select.Option>
        ))}
      </Select>
    );

    // getFieldDecorator('codePrefix', { initialValue: menuPrefixList[0].value });
    const defaultPrompt = {
      root: {
        code: intl.get(`${modelPrompt}.dirCode`).d('目录编码'),

        codeMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.dirCode`).d('目录编码'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.dirCode`).d('目录编码')}`),

        name: intl.get(`${modelPrompt}.dirName`).d('目录名称'),

        nameMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.dirName`).d('目录名称'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.dirName`).d('目录名称')}`),
      },
      dir: {
        code: intl.get(`${modelPrompt}.dirCode`).d('目录编码'),

        codeMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.dirCode`).d('目录编码'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.dirCode`).d('目录编码')}`),

        name: intl.get(`${modelPrompt}.dirName`).d('目录名称'),

        nameMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.dirName`).d('目录名称'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.dirName`).d('目录名称')}`),

        parentName: intl.get(`${modelPrompt}.parentName`).d('上级目录'),

        parentNameMessage: intl
          .get(`${commonPrompt}.validation.requireSelect`, {
            name: intl.get(`${modelPrompt}.parentName`).d('上级目录'),
          })
          .d(`请选择${intl.get(`${modelPrompt}.parentName`).d('上级目录')}`),

        routeMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.route`).d('路由'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.route`).d('路由')}`),
      },
      menu: {
        code: intl.get(`${modelPrompt}.menuCode`).d('菜单编码'),

        codeMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.menuCode`).d('菜单编码'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.menuCode`).d('菜单编码')}`),

        name: intl.get(`${modelPrompt}.menuName`).d('菜单名称'),

        nameMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.menuName`).d('菜单名称'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.menuName`).d('菜单名称')}`),

        parentName: intl.get(`${modelPrompt}.ownDir`).d('所属目录'),

        parentNameMessage: intl
          .get(`${commonPrompt}.validation.requireSelect`, {
            name: intl.get(`${modelPrompt}.ownDir`).d('所属目录'),
          })
          .d(`请选择${intl.get(`${modelPrompt}.ownDir`).d('所属目录')}`),

        routeMessage: intl
          .get(`${commonPrompt}.validation.requireInput`, {
            name: intl.get(`${modelPrompt}.route`).d('路由'),
          })
          .d(`请输入${intl.get(`${modelPrompt}.route`).d('路由')}`),
      },
    };

    return (
      <Fragment>
        <Form>
          <FormItem label={intl.get(`${modelPrompt}.type`).d('类别')} {...formLayout}>
            {getFieldDecorator('type', {
              initialValue: type || 'dir',
              rules: [
                {
                  required: true,
                  message: intl
                    .get(`${commonPrompt}.validation.requireSelect`, {
                      name: intl.get(`${modelPrompt}.type`).d('类别'),
                    })
                    .d(`请选择${intl.get(`${modelPrompt}.type`).d('类别')}`),
                },
              ],
            })(
              <Select disabled={editable} onChange={this.onTypeChange.bind(this)}>
                {menuTypeList.map(n => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          {!tenantRoleLevel && (
            <FormItem
              label={
                <Popover
                  title={intl.get(`${viewMessagePrompt}.title.aboutLevel`).d('关于层级')}
                  arrowPointAtCenter
                  content={
                    <ul
                      style={{
                        padding: 0,
                        color: '#898b96',
                        listStyleType: 'none',
                      }}
                    >
                      <li style={{ lineHeight: '15px' }}>
                        {intl
                          .get(`${viewMessagePrompt}.description.aboutLevel1`)
                          .d('平台层只能包含平台层目录及菜单，且菜单只能选择平台层权限.')}
                      </li>
                      <li style={{ lineHeight: '15px' }}>
                        {intl
                          .get(`${viewMessagePrompt}.description.aboutLevel2`)
                          .d('租户层只能包含租户层目录及菜单，且菜单只能选择租户层权限.')}
                      </li>
                    </ul>
                  }
                  trigger="hover"
                  placement="bottom"
                >
                  {intl.get(`${modelPrompt}.level`).d('层级')} <Icon type="question-circle-o" />
                </Popover>
              }
              {...formLayout}
            >
              {getFieldDecorator('level', {
                initialValue: level || (levelCode[0] || {}).value,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: intl.get(`${modelPrompt}.level`).d('层级'),
                      })
                      .d(`请选择${intl.get(`${modelPrompt}.level`).d('层级')}`),
                  },
                ],
              })(
                <Select onChange={this.onLevelChange.bind(this)} disabled={editable}>
                  {levelCode.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          )}
          <FormItem label={defaultPrompt[type].code} required {...formLayout}>
            {getFieldDecorator(
              'code',
              Object.assign(
                {
                  initialValue: code,
                },
                !editable
                  ? {
                      validateFirst: true,
                      validate: [
                        {
                          trigger: 'onBlur',
                          rules: [{ required: true, message: defaultPrompt[type].codeMessage }],
                        },
                        {
                          trigger: 'onBlur',
                          rules: [{ validator: this.codeValidator.bind(this) }],
                        },
                      ],
                    }
                  : {}
              )
            )(
              <Input
                disabled={editable}
                typeCase="lower"
                addonBefore={editable ? null : selectBefore}
                inputChinese={false}
              />
            )}
          </FormItem>
          <FormItem label={defaultPrompt[type].name} {...formLayout}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                { required: true, message: defaultPrompt[type].nameMessage },
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
                label={defaultPrompt[type].name}
                field="name"
                inputSize={{ zh: 64, en: 64 }}
                // eslint-disable-next-line
                token={_token}
              />
            )}
          </FormItem>
          {type !== 'root' && (
            <FormItem required label={defaultPrompt[type].parentName} {...formLayout}>
              {getFieldDecorator('parentId', {
                initialValue: parentId,
                validateFirst: true,
                validate: [
                  {
                    trigger: 'onBlur',
                    rules: [{ validator: this.parentDirValidator.bind(this) }],
                  },
                  {
                    trigger: 'onBlur',
                    rules: [{ message: defaultPrompt[type].parentNameMessage, required: true }],
                  },
                ],
              })(
                <ParentDirInput
                  textValue={currentParentDir.name || parentName}
                  onClick={this.openDirModal.bind(this)}
                />
              )}
            </FormItem>
          )}
          <FormItem label={intl.get(`${modelPrompt}.quickIndex`).d('快速索引')} {...formLayout}>
            {getFieldDecorator(
              'quickIndex',
              Object.assign({
                initialValue: quickIndex,
                rules: [
                  {
                    max: 60,
                    message: intl
                      .get(`${commonPrompt}.validation.max`, {
                        max: 60,
                      })
                      .d(`长度不能超过${60}个字符`),
                  },
                ],
              })
            )(<Input inputChinese={false} />)}
          </FormItem>
          <FormItem label={intl.get(`${modelPrompt}.route`).d('路由')} {...formLayout}>
            {getFieldDecorator(
              'route',
              Object.assign(
                {
                  initialValue: route,
                  rules: [
                    {
                      max: 64,
                      message: intl
                        .get(`${commonPrompt}.validation.max`, {
                          max: 64,
                        })
                        .d(`长度不能超过${64}个字符`),
                    },
                  ],
                },
                type === 'menu'
                  ? {
                      rules: [
                        { required: true, message: defaultPrompt[type].routeMessage },
                        {
                          max: 64,
                          message: intl
                            .get(`${commonPrompt}.validation.max`, {
                              max: 64,
                            })
                            .d(`长度不能超过${64}个字符`),
                        },
                      ],
                    }
                  : {}
              )
            )(<Input />)}
          </FormItem>
          <FormItem label={intl.get(`${modelPrompt}.sort`).d('序号')} {...formLayout}>
            {getFieldDecorator('sort', {
              initialValue: sort || 0,
            })(<InputNumber min={0} step={1} parser={this.parserSort.bind(this)} />)}
          </FormItem>
          {/* <Col span={12}>
            <FormItem label="启用" {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag,
                valuePropName: 'checked',
              })(<Switch />)}
            </FormItem>
          </Col> */}
          <FormItem label={intl.get(`${modelPrompt}.icon`).d('图标')} {...formLayout}>
            {getFieldDecorator('icon', {
              initialValue: icon || 'setting',
            })(
              <Button onClick={handleOpenIconModal}>
                {isEmpty(getFieldValue('icon')) ? (
                  intl.get(`${viewButtonPrompt}.button.selectIcons`).d('选择图标')
                ) : (
                  <LazyLoadMenuIcon
                    code={getFieldValue('icon')}
                    placeholder={intl.get(`${viewButtonPrompt}.button.selectIcons`).d('选择图标')}
                  />
                )}
              </Button>
            )}
          </FormItem>
          {type === 'menu' && (
            <FormItem
              label={intl.get(`${modelPrompt}.virtualFlag`).d('是否虚拟菜单')}
              {...formLayout}
            >
              {getFieldDecorator('virtualFlag', {
                initialValue: virtualFlag === 1,
                valuePropName: 'checked',
              })(<Switch />)}
            </FormItem>
          )}
          <FormItem label={intl.get(`${modelPrompt}.description`).d('描述')} {...formLayout}>
            {getFieldDecorator('description', {
              initialValue: description,
              rules: [
                {
                  max: 300,
                  message: intl
                    .get(`${commonPrompt}.validation.max`, {
                      max: 300,
                    })
                    .d(`长度不能超过${300}个字符`),
                },
              ],
            })(<TextArea autosize />)}
          </FormItem>
        </Form>
        <DirModal {...dirModalProps} />
      </Fragment>
    );
  }
}
