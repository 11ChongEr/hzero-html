import React, { PureComponent, Fragment } from 'react';
import { Form, Select } from 'hzero-ui';
import { isFunction, isNumber, omit } from 'lodash';
import Lov from 'components/Lov';
import {
  getCodeMeaning,
  getCurrentUser,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';
// import OrganizationModal from './Organization';
// import AssignLevelValueInput from './AssignLevelValueInput';

const FormItem = Form.Item;
const { Option } = Select;

const commonPrompt = 'hzero.common';
const tenantRoleLevel = isTenantRoleLevel();

function defineProperty(obj, property, value) {
  Object.defineProperty(obj, property, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);
    this.getFormItem = this.getFormItem.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  state = {
    isLovOpen: false,
    // organizationModalVisible: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside(e) {
    const { isLovOpen } = this.state;
    const {
      form: { validateFields = o => o },
      setRecord = o => o,
      record,
      editing,
    } = this.props;

    if (
      editing &&
      this.cell !== e.target &&
      (this.cell && isFunction(this.cell.contains)) &&
      !this.cell.contains(e.target) &&
      !isLovOpen
    ) {
      validateFields(error => {
        const newRecord = record;
        if (error) {
          setRecord({ ...defineProperty(newRecord, 'error', error) });
        } else {
          setRecord({ ...omit(newRecord, 'error') });
          return true;
        }
      });
    }
  }

  onLovOk(selectedRow) {
    const {
      record,
      setRecord = e => e,
      dataIndex,
      form: { setFields = e => e },
      // siteMeaning,
    } = this.props;
    const newRecord = { ...record };
    const action = {
      // organizationId: () => {
      //   Object.assign(newRecord, {
      //     tenantName: selectedRow.tenantName,
      //     organizationId: selectedRow.tenantId,
      //     loginName: null,
      //     realName: null,
      //     assignLevelMeaning: null,
      //     assignLevelValueMeaning: null,
      //   });
      //   setFields({
      //     assignLevel: {
      //       value: undefined,
      //     },
      //   });
      // },
      id: () => {
        Object.assign(newRecord, {
          id: selectedRow.id,
          loginName: selectedRow.loginName,
          realName: selectedRow.realName,
          tenantName: selectedRow.tenantName,
          organizationId:
            VERSION_IS_OP && getCurrentOrganizationId() !== 0
              ? getCurrentOrganizationId()
              : selectedRow.organizationId,
          assignLevelMeaning: null, // selectedRow.organizationId !== 0 ? null : siteMeaning,
          assignLevelValueMeaning: null, // selectedRow.organizationId !== 0 ? null : selectedRow.tenantName,
          assignLevelValue:
            VERSION_IS_OP && getCurrentOrganizationId() !== 0 ? selectedRow.organizationId : null, // selectedRow.organizationId !== 0 ? null : selectedRow.organizationId,
          // assignLevelValue: null, // selectedRow.organizationId !== 0 ? null : selectedRow.organizationId,
          // assignLevelValue: (VERSION_IS_OP && getCurrentOrganizationId() !== 0) ? 0 : null,
        });
        setFields({
          assignLevel: {
            value: undefined, // selectedRow.organizationId !== 0 ? undefined : 'site',
          },
        });
      },
      assignLevelValue: () => {
        Object.assign(newRecord, {
          assignLevelValue: selectedRow.unitId,
          assignLevelValueMeaning: selectedRow.unitName,
        });
      },
    };
    if (action[dataIndex]) {
      action[dataIndex]();
    }
    setRecord(newRecord);
  }

  onLovCancel() {
    this.setState({
      isLovOpen: false,
    });
  }

  onAssignLevelChange(value) {
    const {
      record = {},
      setRecord = e => e,
      options = [],
      dataIndex,
      roleTenantId,
      roleTenantName,
    } = this.props;
    const newRecord = record;
    newRecord.assignLevel = value;
    newRecord[`${dataIndex}Meaning`] = getCodeMeaning(value, options);
    Object.assign(
      newRecord,
      value === 'org'
        ? {
            assignLevelValue: null,
            assignLevelValueMeaning: null,
            sourceType: null,
          }
        : {
            assignLevelValue: roleTenantId, // record.organizationId,
            assignLevelValueMeaning: roleTenantName, // record.tenantName,
          }
    );
    setRecord(newRecord);
  }

  onSelectBlur() {}

  onSelectFocus() {}

  // openOrganizationModal() {
  //   const { handleFetchOrganizationData = e => e, record } = this.props;
  //   this.setState({
  //     organizationModalDataSource: [],
  //     organizationModalVisible: true,
  //     isLovOpen: true,
  //   });
  //   handleFetchOrganizationData(record.organizationId).then(res => {
  //     if (res) {
  //       this.setState({
  //         organizationModalDataSource: isEmpty(res) ? [] : res,
  //       });
  //     }
  //   });
  // }

  closeOrganizationModal() {
    // const { form: { setFieldsValue = e => e } } = this.props;
    this.setState({
      // organizationModalDataSource: [],
      // organizationModalVisible: false,
      isLovOpen: false,
    });
  }

  onOrganizationModalOk(selectedRow) {
    const {
      form: { setFieldsValue = e => e },
      record,
    } = this.props;
    const { setRecord = e => e } = this.state;
    setFieldsValue({
      assignLevelValue: selectedRow.unitId,
    });
    setRecord({
      ...record,
      assignLevelValue: selectedRow.unitId,
      assignLevelValueMeaning: selectedRow.unitName,
      sourceType: selectedRow.level,
    });
    // this.setState({
    //   dataSource: dataSource.map(n => n.key === currentEditingRow.key ? ({ ...n, selectedRow }) : n),
    // });
  }

  getFormItem() {
    const {
      dataIndex,
      title,
      record,
      form = {},
      options = [],
      editing,
      roleId,
      // currentEditingRow = {},
      // handleFetchOrganizationData = e => e,
    } = this.props;
    const user = getCurrentUser();
    // const { organizationModalVisible, organizationModalDataSource } = this.state;
    const { getFieldDecorator = e => e /* , getFieldValue = e => e */ } = form;
    // const organizationModalProps = {
    //   dataSource: organizationModalDataSource,
    //   visible: organizationModalVisible,
    //   onCancel: this.closeOrganizationModal.bind(this),
    //   onOk: this.onOrganizationModalOk.bind(this),
    //   organizationId: record.organizationId,
    //   prompt: {
    //     unitCode: prompt.unitCode,
    //     unitName: prompt.unitName,
    //     selectUnit: prompt.selectUnit,
    //   },
    //   handleFetchData: handleFetchOrganizationData,
    // };
    const defaultFormItem = {
      // organizationId: () =>
      //   editing ? (
      //     <div
      //       ref={node => {
      //         this.cell = node;
      //       }}
      //       className="editable-cell-value"
      //     >
      //       <FormItem style={{ marginBottom: 0 }}>
      //         {getFieldDecorator(dataIndex, {
      //           rules: [
      //             {
      //               required: true,
      //               message: prompt.requireSelect(title),
      //             },
      //           ],
      //           initialValue: record[dataIndex],
      //         })(
      //           <Lov
      //             ref={node => {
      //               this.input = node;
      //             }}
      //             style={{ width: 140 }}
      //             textValue={record.tenantName}
      //             code="HPFM.TENANT"
      //             onOk={this.onLovOk.bind(this)}
      //           />
      //         )}
      //       </FormItem>
      //     </div>
      //   ) : (
      //     <Fragment>
      //       <div className="editable-cell-value-wrap">{record.tenantName}</div>
      //     </Fragment>
      //   ),
      id: () =>
        editing ? (
          <div
            ref={node => {
              this.cell = node;
            }}
            className="editable-cell-value"
          >
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(dataIndex, {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: title,
                      })
                      .d(`请选择${title}`),
                    type: 'number',
                  },
                ],
                initialValue: record[dataIndex],
              })(
                <Lov
                  ref={node => {
                    this.input = node;
                  }}
                  style={{ width: 150 }}
                  textValue={record.realName}
                  code={tenantRoleLevel ? 'HIAM.USER.ORG' : 'HIAM.USER'}
                  onClick={this.onOpenLov}
                  onOk={this.onLovOk.bind(this)}
                  queryParams={{
                    excludeUserIds: [user.id],
                  }}
                />
              )}
            </FormItem>
          </div>
        ) : (
          <Fragment>
            <div className="editable-cell-value-wrap">{record.realName}</div>
          </Fragment>
        ),
      assignLevel: () =>
        editing ? (
          <div
            ref={node => {
              this.cell = node;
            }}
            className="editable-cell-value"
          >
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(dataIndex, {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: title,
                      })
                      .d(`请选择${title}`),
                  },
                ],
                initialValue: record[dataIndex],
              })(
                <Select
                  ref={node => {
                    this.input = node;
                  }}
                  style={{ width: 120 }}
                  onChange={this.onAssignLevelChange.bind(this)}
                  disabled={!isNumber(record.organizationId)}
                >
                  {options.map(o => (
                    <Option key={o.value} value={o.value}>
                      {o.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </div>
        ) : (
          <Fragment>
            <div className="editable-cell-value-wrap">{record.assignLevelMeaning}</div>
          </Fragment>
        ),
      assignLevelValue: () =>
        editing && record.assignLevel === 'org' ? (
          <div
            ref={node => {
              this.cell = node;
            }}
            className="editable-cell-value"
          >
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(dataIndex, {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: title,
                      })
                      .d(`请选择${title}`),
                  },
                ],
                initialValue: record[dataIndex],
              })(
                // <AssignLevelValueInput
                //   ref={node => {
                //     this.input = node;
                //   }}
                //   textValue={record.assignLevelValueMeaning}
                //   onClick={this.openOrganizationModal.bind(this, record)}
                // />
                <Lov
                  ref={node => {
                    this.input = node;
                  }}
                  style={{ width: 150 }}
                  textValue={record.assignLevelValueMeaning}
                  code="HIAM.ASSIGN_LEVEL_VALUE_ORG"
                  onClick={this.onOpenLov}
                  onOk={this.onLovOk.bind(this)}
                  queryParams={{
                    roleId,
                  }}
                />
              )}
            </FormItem>
            {/* {currentEditingRow.key === record.key && (
              <OrganizationModal {...organizationModalProps} />
            )} */}
          </div>
        ) : (
          <Fragment>
            <div className="editable-cell-value-wrap">{record.assignLevelValueMeaning}</div>
          </Fragment>
        ),
    };
    return defaultFormItem[dataIndex]();
  }

  render() {
    return this.getFormItem();
  }
}
