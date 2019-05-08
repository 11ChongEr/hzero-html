import React from 'react';
import { Form, Input, InputNumber, Select, Divider, Table, Button, Spin } from 'hzero-ui';
import { cloneDeep, isEmpty, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import ModalForm from 'components/Modal/ModalForm';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

@Form.create({ fieldNameProp: null })
export default class EditForm extends ModalForm {
  constructor(props) {
    super(props);
    const { data = {} } = props;
    this.state = {
      data,
      deleteDocTypeAssigns: [], // 删除的租户列表
      addDocTypeAssigns: [], // 新增的租户列表
      selectedRowKeys: [],
      selectedRow: {}, // 选中的租户
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data: prevData } = prevState;
    const { data } = nextProps;
    if (data !== prevData) {
      return {
        ...prevState,
        data,
      };
    } else {
      return null;
    }
  }

  /**
   * 保存编辑数据
   */
  @Bind()
  onOk() {
    const { deleteDocTypeAssigns = [], addDocTypeAssigns = [], data } = this.state;
    const { form, handleSave } = this.props;
    form.validateFields({ force: true }, (err, fieldsValue) => {
      if (err) return;
      const params = {
        ...data,
        ...fieldsValue,
        orderSeq: fieldsValue.orderSeq || 0,
        docTypeAssigns: [...deleteDocTypeAssigns, ...addDocTypeAssigns],
      };
      handleSave(params);
    });
  }

  /**
   * 租户维护新增租户
   * @param {*} _
   * @param {*} record - 选择行记录
   */
  @Bind()
  addTenant(_, record) {
    const {
      addDocTypeAssigns = [],
      deleteDocTypeAssigns = [],
      data: { docTypeAssigns = [], docTypeId } = {},
    } = this.state;
    const sourceIndex = isArray(docTypeAssigns)
      ? docTypeAssigns.findIndex(item => item.tenantNum === record.tenantNum)
      : -1;
    const addIndex = isArray(addDocTypeAssigns)
      ? addDocTypeAssigns.findIndex(item => item.tenantNum === record.tenantNum)
      : -1;
    const deleteIndex = isArray(deleteDocTypeAssigns)
      ? deleteDocTypeAssigns.findIndex(item => item.tenantNum === record.tenantNum)
      : -1;

    // 避免重复添加
    if (sourceIndex === -1 && addIndex === -1) {
      const { tenantNum, tenantName, tenantId } = record;
      const newAddDocTypeAssigns = [
        ...addDocTypeAssigns,
        {
          assignValueId: tenantId,
          docTypeId,
          actionType: 1,
          tenantNum,
          tenantName,
        },
      ];
      this.setState({
        addDocTypeAssigns: newAddDocTypeAssigns,
      });
    } else if (deleteIndex !== -1) {
      const newDeleteDocTypeAssigns = cloneDeep(deleteDocTypeAssigns);
      newDeleteDocTypeAssigns.splice(deleteIndex, 1);
      this.setState({
        deleteDocTypeAssigns: newDeleteDocTypeAssigns,
      });
    }
    this.setState({
      selectedRow: {},
      selectedRowKeys: [],
    });
  }

  /**
   * 点击表格行时将当前行设为点击行数据
   * @param {Object} record - 单据权限行数据
   */
  @Bind()
  onRow(record) {
    this.setState({
      selectedRowKeys: [record.tenantNum],
      selectedRow: record,
    });
  }

  /**
   * 租户级租户维护删除租户
   */
  @Bind()
  deleteTenant() {
    const {
      deleteDocTypeAssigns = [],
      addDocTypeAssigns = [],
      selectedRowKeys = [],
      data: { docTypeAssigns = [] } = {},
    } = this.state;

    if (!isEmpty(selectedRowKeys)) {
      let newDeleteDocTypeAssigns = cloneDeep(deleteDocTypeAssigns);
      const newAddDocTypeAssigns = cloneDeep(addDocTypeAssigns);
      selectedRowKeys.forEach(element => {
        const sourceIndex = isArray(docTypeAssigns)
          ? docTypeAssigns.findIndex(item => item.tenantNum === element)
          : -1;
        const addIndex = newAddDocTypeAssigns.findIndex(item => item.tenantNum === element);
        if (sourceIndex !== -1) {
          newDeleteDocTypeAssigns = [
            ...newDeleteDocTypeAssigns,
            {
              ...docTypeAssigns[sourceIndex],
              actionType: 0,
            },
          ];
        } else if (addIndex !== -1) {
          newAddDocTypeAssigns.splice(addIndex, 1);
        }
      });
      // console.log(newDeleteDocTypeAssigns, newAddDocTypeAssigns);
      this.setState({
        deleteDocTypeAssigns: newDeleteDocTypeAssigns,
        addDocTypeAssigns: newAddDocTypeAssigns,
        selectedRowKeys: [],
      });
    } else {
      this.setState({
        selectedRowKeys: [],
      });
    }
  }

  /**
   * 侧栏隐藏时清空状态
   */
  @Bind()
  resetState() {
    this.setState({
      data: {},
      deleteDocTypeAssigns: [], // 删除的租户列表
      addDocTypeAssigns: [], // 新增的租户列表
      selectedRowKeys: [],
      selectedRow: {}, // 选中的租户
    });
  }

  renderForm() {
    const {
      deleteDocTypeAssigns = [],
      addDocTypeAssigns = [],
      selectedRowKeys = [],
      data = {},
    } = this.state;
    const {
      loading,
      form: { getFieldDecorator, getFieldsValue },
      docTypeLevelCode = [],
    } = this.props;
    const {
      docTypeCode,
      docTypeName,
      sourceServiceName,
      sourceDataEntity,
      levelCode,
      ruleCode,
      ruleName,
      orderSeq,
      description,
      enabledFlag = 1,
      docTypeAssigns = [],
    } = data;
    const columns = [
      {
        title: intl.get('hiam.docType.model.docType.tenantNum').d('租户编号'),
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('hiam.docType.model.docType.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
      },
    ];
    const tenantDataSource = isArray(docTypeAssigns)
      ? [
          ...docTypeAssigns.filter(
            item => deleteDocTypeAssigns.findIndex(e => e.tenantNum === item.tenantNum) === -1
          ),
          ...addDocTypeAssigns,
        ]
      : addDocTypeAssigns;

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRow: rows[0],
        });
      },
    };

    const formLayOut = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    };

    return (
      <Spin spinning={loading}>
        <Divider orientation="left">
          {intl.get('hiam.docType.view.title.basicSection').d('单据权限类型基本信息')}
        </Divider>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.docTypeCode').d('类型编码')}
        >
          {getFieldDecorator('docTypeCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.docType.model.docType.docTypeCode').d('类型编码'),
                }),
              },
            ],
            initialValue: docTypeCode,
          })(<Input inputChinese={false} typeCase="upper" maxLength={30} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.docTypeName').d('类型名称')}
        >
          {getFieldDecorator('docTypeName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.docType.model.docType.docTypeName').d('类型名称'),
                }),
              },
            ],
            initialValue: docTypeName,
          })(<Input maxLength={240} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.sourceServiceName').d('来源微服务')}
        >
          {getFieldDecorator('sourceServiceName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.docType.model.docType.sourceServiceName').d('来源微服务'),
                }),
              },
            ],
            initialValue: sourceServiceName,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.sourceDataEntity').d('来源数据实体')}
        >
          {getFieldDecorator('sourceDataEntity', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.docType.model.docType.sourceDataEntity').d('来源数据实体'),
                }),
              },
            ],
            initialValue: sourceDataEntity,
          })(<Input />)}
        </Form.Item>
        {!isTenantRoleLevel() && (
          <Form.Item
            {...formLayOut}
            label={intl.get('hiam.docType.model.docType.levelCode').d('层级')}
          >
            {getFieldDecorator('levelCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.docType.model.docType.levelCode').d('层级'),
                  }),
                },
              ],
              initialValue: levelCode,
            })(
              <Select style={{ width: 150 }}>
                {docTypeLevelCode.map(m => {
                  return (
                    <Select.Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        )}
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.ruleCode').d('数据屏蔽规则代码')}
        >
          {getFieldDecorator('ruleCode', {
            initialValue: ruleCode,
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.ruleName').d('数据屏蔽规则名称')}
        >
          {getFieldDecorator('ruleName', {
            initialValue: ruleName,
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.orderSeq').d('排序号')}
        >
          {getFieldDecorator('orderSeq', {
            initialValue: orderSeq || 0,
          })(<InputNumber style={{ width: 150 }} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('hiam.docType.model.docType.description').d('描述')}
        >
          {getFieldDecorator('description', {
            initialValue: description,
          })(<Input />)}
        </Form.Item>
        <Form.Item {...formLayOut} label={intl.get('hzero.common.status.enable').d('启用')}>
          {getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag,
          })(<Switch />)}
        </Form.Item>
        {/* 层级为租户时出现租户维护列表 */}
        {getFieldsValue().levelCode === 'TENANT' ? (
          <React.Fragment>
            <Divider orientation="left">
              {intl.get('hiam.docType.view.title.tenantSection').d('租户维护')}
            </Divider>
            <Lov isButton icon="plus" code="HPFM.TENANT" onChange={this.addTenant}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Lov>
            <Button icon="delete" onClick={this.deleteTenant} style={{ marginLeft: 8 }}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Table
              bordered
              rowKey="tenantNum"
              pagination={false}
              columns={columns}
              dataSource={tenantDataSource}
              style={{
                marginTop: 20,
              }}
              onRow={record => {
                return {
                  onClick: () => this.onRow(record),
                };
              }}
              rowSelection={rowSelection}
            />
          </React.Fragment>
        ) : null}
      </Spin>
    );
  }
}
