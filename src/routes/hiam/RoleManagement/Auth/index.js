import React from 'react';
import { Form, Input, Button, Table, Row, Col, Radio, Checkbox as OriginCheckbox } from 'hzero-ui';
import { cloneDeep, isEmpty, isArray, differenceBy } from 'lodash';
import { Bind } from 'lodash-decorators';

import ModalForm from 'components/Modal/ModalForm';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, tableScrollWidth } from 'utils/utils';

import styles from '../index.less';

const CheckboxGroup = OriginCheckbox.Group;
const RadioGroup = Radio.Group;

@formatterCollections({ code: 'hiam.roleManagement' })
@Form.create({ fieldNameProp: null })
export default class AuthDrawer extends ModalForm {
  constructor(props) {
    super(props);
    const {
      roleAuth = {},
      roleAuth: { content = [] },
      roleAuthScopeCode = [],
      roleAuthScopeTypeCode = [],
    } = props;
    const selectedRowKeys = content
      .filter(item => !!item.docEnabledFlag)
      .map(item => item.authDocTypeId);
    this.state = {
      currentAuthScope: null, // 当前选中的范围
      authUserDefaultValue: null, // 数据为用户范围时的选中值
      selectedRow: {}, // 选中的单据行数据
      selectedRowKeys, // 选择项
      key: 'authDocTypeId', // 单据主键
      roleAuth,
      roleAuthScopeCode,
      roleAuthScopeTypeCode,
      authDefaultValue: [], // 权限维度默认选中的列表
      enableChangeList: [],
      msgChangeList: [],
      scopeChangeList: [],
      authChangeList: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedRowKeys: prevSelectedRowKeys } = prevState;
    const {
      roleAuth,
      roleAuth: { content = [] },
      roleAuthScopeCode,
      roleAuthScopeTypeCode,
    } = nextProps;
    const selectedRowKeys = isEmpty(prevSelectedRowKeys)
      ? content.filter(item => !!item.docEnabledFlag).map(item => item.authDocTypeId)
      : prevSelectedRowKeys;
    return {
      ...prevState,
      roleAuth,
      selectedRowKeys,
      roleAuthScopeCode,
      roleAuthScopeTypeCode,
    };
  }

  @Bind()
  onOk() {
    const { handleSave, form } = this.props;
    const { scopeChangeList, authChangeList, enableChangeList } = this.state;

    form.validateFields((err, fieldsValue) => {
      const { searchDocTypeName, ...msgFlags } = fieldsValue;
      const checkedList = Object.keys(msgFlags)
        .filter(item => !!msgFlags[item])
        .map(item => item.split('#')[0] * 1);

      const {
        roleAuth: { content = [] },
        key,
      } = this.state;
      const dataClone = cloneDeep(content);

      const newMsgChangeList = dataClone
        .filter(item => {
          return !!item.docEnabledFlag && item.msgFlag
            ? checkedList.findIndex(e => e === item[key]) === -1
            : checkedList.findIndex(e => e === item[key]) !== -1;
        })
        .map(item => {
          delete item.roleAuthorityLines; // eslint-disable-line
          return {
            ...item,
            msgFlag: !item.msgFlag ? 1 : 0,
          };
        });
      const data = this.createSaveData(
        enableChangeList,
        newMsgChangeList,
        scopeChangeList,
        authChangeList
      );
      handleSave(data);
    });
  }

  @Bind()
  onRow(record) {
    const { roleAuthScopeTypeCode } = this.state;
    const authDefaultValue = record.roleAuthorityLines
      .filter(item => !!item.enabledFlag)
      .map(item => item.authDimId);
    const userScopeTypeCode = roleAuthScopeTypeCode.filter(item => item.parentValue === 'USER');
    const authUserDefaultValue = record.roleAuthorityLines
      .filter(
        item =>
          userScopeTypeCode.findIndex(e => e.value === item.authTypeCode) !== -1 &&
          !!item.enabledFlag
      )
      .map(item => item.authDimId)[0];
    this.setState({
      authDefaultValue,
      authUserDefaultValue,
      selectedRow: record,
      currentAuthScope: record.authScopeCode,
    });
  }

  /**
   * 为当前点击行添加 class
   * @param {Object} record - 行数据
   */
  @Bind()
  addHighlight(record) {
    const { selectedRow } = this.state;
    return record.authDocTypeId === selectedRow.authDocTypeId ? styles['auth-row-hover'] : '';
  }

  /**
   * 勾选单据项列表时，添加或删除单据项
   * @param {*} selectedRowKeys - 选中的单据项列表
   */
  @Bind()
  onSelectChange(rowkeys = []) {
    const {
      key,
      enableChangeList = [],
      roleAuth: { content = [] },
    } = this.state;
    const otherEnableChangeList = differenceBy(enableChangeList, content, 'authDocTypeId'); // 其他页面改变启用的单据列表

    const dataClone = cloneDeep(content);
    const currentEnableChangeList = dataClone
      .filter(item => {
        return item.docEnabledFlag
          ? rowkeys.findIndex(e => e === item[key]) === -1
          : rowkeys.findIndex(e => e === item[key]) !== -1;
      })
      .map(item => ({
        ...item,
        docEnabledFlag: item.docEnabledFlag ? 0 : 1,
      }));
    this.setState({
      enableChangeList: [...otherEnableChangeList, ...currentEnableChangeList],
    });
  }

  @Bind()
  handleSearch(pagination) {
    const { form, handleQuery } = this.props;
    form.validateFields((err, fieldsValue) => {
      const params = {
        page: pagination ? pagination.current - 1 : 0,
        size: pagination ? pagination.pageSize : 10,
        docTypeName: fieldsValue.searchDocTypeName,
      };
      handleQuery(params);
    });
  }

  @Bind()
  handleAdd() {
    const { handleAdd = e => e } = this.props;
    const { editRowList } = this.state;
    handleAdd(editRowList);
  }

  @Bind()
  handleDelete() {
    const { handleDelete = e => e } = this.props;
    const { selectedRow } = this.state;
    handleDelete(selectedRow);
  }

  @Bind()
  resetState() {
    this.setState({
      currentAuthScope: null, // 当前选中的范围
      authUserDefaultValue: null, // 用户范围下当前选中
      selectedRow: {}, // 选中的单据行数据
      roleAuth: {},
      roleAuthScopeCode: null,
      roleAuthScopeTypeCode: null,
      authDefaultValue: [],
      enableChangeList: [],
      msgChangeList: [],
      scopeChangeList: [],
      authChangeList: [],
    });
  }

  /**
   * 消息发送变更事件
   * @param {Array} checkedList - 消息发送标志启用列表
   */
  @Bind()
  msgOnChange() {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      const { searchDocTypeName, ...msgFlags } = fieldsValue;
      const checkedList = Object.keys(msgFlags)
        .filter(item => !!msgFlags[item])
        .map(item => item.split('#')[0] * 1);

      const {
        roleAuth: { content = [] },
        key,
        selectedRow,
      } = this.state;
      const dataClone = cloneDeep(content);

      const newMsgChangeList = dataClone
        .filter(item => {
          return !!item.docEnabledFlag && item.msgFlag
            ? checkedList.findIndex(e => e === item[key]) === -1
            : checkedList.findIndex(e => e === item[key]) !== -1;
        })
        .map(item => {
          delete item.roleAuthorityLines; // eslint-disable-line
          return {
            ...item,
            msgFlag: !item.msgFlag ? 1 : 0,
          };
        });
      this.setState({
        msgChangeList: newMsgChangeList,
      });

      const index = newMsgChangeList.findIndex(item => item[key] === selectedRow[key]);

      if (index !== -1) {
        this.setState({
          selectedRow: {
            ...selectedRow,
            msgFlag: newMsgChangeList[index].msgFlag,
          },
        });
      }
    });
  }

  /* eslint-disable no-param-reassign */

  /**
   * 延迟 onChange 事件执行，解决先于 onRow 事件执行问题
   * @param {Object} e - RadioGroup Change 事件
   */
  @Bind()
  scopeOnChangeLater(e) {
    setTimeout(() => {
      this.scopeOnChange(e);
    }, 0);
  }

  /**
   * 权限范围类型变更事件
   * @param {Object} e - 变更事件对象
   */
  @Bind()
  scopeOnChange(e) {
    const {
      selectedRow,
      roleAuth: { content = [] },
      scopeChangeList = [],
      key,
    } = this.state;
    const dataClone = cloneDeep(content);
    const newScopeChangeList = cloneDeep(scopeChangeList);
    const sourceRow = dataClone.find(item => item[key] === selectedRow[key]); // 找到原始单据项
    const index = scopeChangeList.findIndex(item => item[key] === selectedRow[key]);
    if (sourceRow.authScopeCode !== e.target.value) {
      if (index !== -1) {
        newScopeChangeList.splice(index, 1, {
          ...sourceRow,
          authScopeCode: e.target.value,
        });
        this.setState({
          scopeChangeList: newScopeChangeList.map(item => {
            delete item.msgFlag;
            delete item.roleAuthorityLines;
            return item;
          }),
        });
      } else {
        this.setState({
          scopeChangeList: [
            ...scopeChangeList,
            {
              ...sourceRow,
              authScopeCode: e.target.value,
            },
          ].map(item => {
            delete item.msgFlag;
            delete item.roleAuthorityLines;
            return item;
          }),
        });
      }
    } else if (index !== -1) {
      newScopeChangeList.splice(index, 1);
      this.setState({
        scopeChangeList: newScopeChangeList.map(item => {
          delete item.msgFlag;
          delete item.roleAuthorityLines;
          return item;
        }),
      });
    }
    this.setState({
      currentAuthScope: e.target.value,
      selectedRow: {
        ...selectedRow,
        authScopeCode: e.target.value,
      },
    });
  }

  /**
   * 权限维度变更事件
   * @param {Array} checkedList - 选中的权限项列表
   */
  @Bind()
  authOnChange(checkedList) {
    const {
      selectedRow,
      roleAuth: { content = [] },
      authChangeList = [],
      key,
    } = this.state;
    const dataClone = cloneDeep(content);
    const newAuthChangeList = cloneDeep(authChangeList);
    const sourceRow = dataClone.find(item => item[key] === selectedRow[key]); // 找到原始单据项
    const sourceList = dataClone.find(item => item[key] === selectedRow[key]).roleAuthorityLines; // 查找原始 List
    let editRow;
    if (isArray(checkedList)) {
      editRow = {
        ...sourceRow,
        roleAuthorityLines: sourceList
          .filter(item => {
            return item.enabledFlag
              ? checkedList.findIndex(e => e === item.authDimId) === -1
              : checkedList.findIndex(e => e === item.authDimId) !== -1;
          })
          .map(item => ({ ...item, enabledFlag: !item.enabledFlag ? 1 : 0 })),
      }; // 将变更过的权限列表项添加
    } else {
      editRow = {
        ...sourceRow,
        roleAuthorityLines: sourceList
          .filter(item => item.authDimId === checkedList.target.value)
          .map(item => ({ ...item, enabledFlag: 1 })),
      };
    }

    const index = authChangeList.findIndex(item => item[key] === editRow[key]);

    if (isEmpty(editRow.roleAuthorityLines)) {
      if (index !== -1) {
        newAuthChangeList.splice(index, 1);
        this.setState({
          authChangeList: newAuthChangeList.map(item => {
            delete item.msgFlag;
            return item;
          }),
        });
      }
    } else if (index !== -1) {
      newAuthChangeList.splice(index, 1, editRow);
      this.setState({
        authChangeList: newAuthChangeList.map(item => {
          delete item.msgFlag;
          return item;
        }),
      });
    } else {
      this.setState({
        authChangeList: [...newAuthChangeList, editRow].map(item => {
          delete item.msgFlag;
          return item;
        }),
      });
    }
    if (!isArray(checkedList)) {
      this.setState({
        authUserDefaultValue: checkedList.target.value,
      });
    } else {
      this.setState({
        authDefaultValue: checkedList,
      });
    }

    // 选择权限维度项时触发范围修改
    if (!isArray(checkedList)) {
      const { currentAuthScope } = this.state;
      if (currentAuthScope !== 'USER') {
        const params = {
          target: {
            value: 'USER',
          },
        };
        this.scopeOnChange(params);
      }
    } else {
      const { currentAuthScope } = this.state;
      if (currentAuthScope !== 'BIZ') {
        const params = {
          target: {
            value: 'BIZ',
          },
        };
        this.scopeOnChange(params);
      }
    }
    this.setState({
      selectedRow: {
        ...selectedRow,
        roleAuthorityLines: selectedRow.roleAuthorityLines.map(item => {
          const idx = editRow.roleAuthorityLines.findIndex(e => e.authDimId === item.authDimId);
          if (idx !== -1) {
            return {
              ...item,
              enabledFlag: editRow.roleAuthorityLines[idx].enabledFlag,
            };
          } else {
            return item;
          }
        }),
      },
    });
  }

  /**
   * 合并数据进行展示
   * @param {Array} sourceData - 原始数据
   * @param {Array} msgChangeList - 消息发送标志变化的数据
   * @param {Array} scopeChangeList - 权限范围变化的数据
   * @param {Array} authChangeList - 权限维度变化的数据
   */
  @Bind()
  mergeData(
    sourceData = [],
    enableChangeList = [],
    msgChangeList = [],
    scopeChangeList = [],
    authChangeList = []
  ) {
    const { key } = this.state;
    const data = sourceData.map(item => {
      const enableIndex = enableChangeList.findIndex(e => e[key] === item[key]);
      const msgIndex = msgChangeList.findIndex(e => e[key] === item[key]);
      const scopeIndex = scopeChangeList.findIndex(e => e[key] === item[key]);
      const authIndex = authChangeList.findIndex(e => e[key] === item[key]);
      const newRoleAuthorityLines = cloneDeep(item.roleAuthorityLines);

      if (authIndex !== -1) {
        const changeList = authChangeList[authIndex].roleAuthorityLines;
        changeList.forEach(e => {
          const index = newRoleAuthorityLines.findIndex(line => line.authDimId === e.authDimId);
          newRoleAuthorityLines.splice(index, 1, e);
        });
      }
      return {
        ...item,
        docEnabledFlag:
          enableIndex !== -1 ? enableChangeList[enableIndex].docEnabledFlag : item.docEnabledFlag,
        msgFlag: msgIndex !== -1 ? msgChangeList[msgIndex].msgFlag : item.msgFlag,
        authScopeCode:
          scopeIndex !== -1 ? scopeChangeList[scopeIndex].authScopeCode : item.authScopeCode,
        roleAuthorityLines: newRoleAuthorityLines,
      };
    });
    return data;
  }

  @Bind()
  createSaveData(
    enableChangeList = [],
    msgChangeList = [],
    scopeChangeList = [],
    authChangeList = []
  ) {
    const { key, roleAuthScopeTypeCode } = this.state;
    const newEnableChangeList = enableChangeList.map(item => {
      const { roleAuthorityLines, msgFlag, ...other } = item;
      return {
        ...other,
      };
    });
    const saveList = [...newEnableChangeList];

    msgChangeList.forEach(item => {
      const index = saveList.findIndex(e => e[key] === item[key]);
      if (index !== -1) {
        saveList.splice(index, 1, {
          ...saveList[index],
          msgFlag: item.msgFlag,
        });
      } else {
        saveList.push(item);
      }
    });

    scopeChangeList.forEach(item => {
      const index = saveList.findIndex(e => e[key] === item[key]);
      if (index !== -1) {
        saveList.splice(index, 1, {
          ...saveList[index],
          authScopeCode: item.authScopeCode,
        });
      } else {
        saveList.push(item);
      }
    });

    authChangeList.forEach(item => {
      const index = saveList.findIndex(e => e[key] === item[key]);
      if (index !== -1) {
        saveList.splice(index, 1, {
          ...saveList[index],
          roleAuthorityLines: item.roleAuthorityLines,
        });
      } else {
        saveList.push(item);
      }
    });

    return saveList
      .map(item => {
        const auths = item.roleAuthorityLines || [];
        const currentScopeTypeCode = roleAuthScopeTypeCode.filter(
          e => e.parentValue === item.authScopeCode
        );

        // 判断是否具备 auth 变更
        return isArray(item.roleAuthorityLines)
          ? {
              ...item,
              roleAuthorityLines: auths.filter(
                e =>
                  !!e.authDimId &&
                  currentScopeTypeCode.findIndex(f => f.value === e.authTypeCode) !== -1
              ), // 过滤非修改权限范围类型内的权限维度以及未启用的权限维度
            }
          : item;
      })
      .filter(item => !(isArray(item.roleAuthorityLines) && isEmpty(item.roleAuthorityLines)));
  }

  renderForm() {
    const { form, loading } = this.props;
    const {
      selectedRow,
      roleAuthScopeCode = [],
      roleAuthScopeTypeCode = [],
      key,
      currentAuthScope, // 当前选中的维度类型
      authUserDefaultValue, // 数据为用户范围时的选中值
      roleAuth,
      roleAuth: { content = [] },
      authDefaultValue = [], // 默认选中的列表
      enableChangeList = [],
      msgChangeList = [],
      scopeChangeList = [],
      authChangeList = [],
    } = this.state;
    const dataSource = this.mergeData(
      content,
      enableChangeList,
      msgChangeList,
      scopeChangeList,
      authChangeList
    );

    const bizRoleAuthorityLines =
      selectedRow.roleAuthorityLines &&
      selectedRow.roleAuthorityLines.filter(item => {
        return (
          roleAuthScopeTypeCode
            .filter(e => e.parentValue === 'BIZ')
            .findIndex(e => e.value === item.authTypeCode) !== -1
        );
      });

    const userRoleAuthorityLines =
      selectedRow.roleAuthorityLines &&
      selectedRow.roleAuthorityLines.filter(item => {
        return (
          roleAuthScopeTypeCode
            .filter(e => e.parentValue === 'USER')
            .findIndex(e => e.value === item.authTypeCode) !== -1
        );
      });

    // const selectedRowKeys = dataSource
    //   .filter(item => !!item.docEnabledFlag)
    //   .map(item => item.authDocTypeId);
    const columns = [
      {
        title: intl.get('hiam.roleManagement.model.role.docType').d('单据'),
        dataIndex: 'docTypeName',
      },
      // {
      //   title: intl.get('hiam.roleManagement.model.role.msgFlag').d('消息发送'),
      //   width: 80,
      //   align: 'center',
      //   dataIndex: 'msgFlag',
      //   render: (value, record) => (
      //     <Form.Item style={{ marginBottom: 0 }}>
      //       {form.getFieldDecorator(`${record.authDocTypeId}#msgFlag`, {
      //         initialValue: value || 0,
      //       })(<Checkbox />)}
      //     </Form.Item>
      //   ),
      // },
      {
        title: intl.get('hiam.roleManagement.model.role.authRang').d('权限维度范围'),
        width: 250,
        dataIndex: 'msgFlag',
        render: (_, record) => (
          <RadioGroup value={record.authScopeCode} onChange={this.scopeOnChangeLater}>
            {roleAuthScopeCode.map(item => (
              <Radio
                value={item.value}
                key={item.value}
                style={{ marginRight: 0, padding: '0 10px' }}
              >
                {item.meaning}
              </Radio>
            ))}
          </RadioGroup>
        ),
      },
    ];

    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.onSelectChange,
    // };

    const authDim =
      !isEmpty(selectedRow) &&
      (currentAuthScope === 'USER' ? (
        <RadioGroup
          value={authUserDefaultValue}
          onChange={this.authOnChange}
          style={{ width: '100%' }}
        >
          <Row>
            {userRoleAuthorityLines.map(item => (
              <Col span={24} key={item.authDimId}>
                <Radio value={item.authDimId} key={item.authDimId} style={{ height: 30 }}>
                  {item.authTypeMeaning}
                </Radio>
              </Col>
            ))}
          </Row>
        </RadioGroup>
      ) : (
        <CheckboxGroup
          style={{ width: '100%' }}
          onChange={this.authOnChange}
          value={authDefaultValue}
        >
          <Row>
            {bizRoleAuthorityLines.map(item => (
              <Col span={24} key={item.authDimId}>
                <Checkbox style={{ height: 30 }} key={item.authDimId} value={item.authDimId}>
                  {item.authTypeMeaning}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </CheckboxGroup>
      ));

    return (
      <React.Fragment>
        <Row gutter={24}>
          <Col span={16}>
            <Form layout="inline">
              <Row>
                <Form.Item label={intl.get('hiam.roleManagement.model.role.docType').d('单据')}>
                  {form.getFieldDecorator('searchDocTypeName')(<Input style={{ width: 300 }} />)}
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Row>
            </Form>
            <Table
              bordered
              rowKey={key}
              style={{
                marginTop: 16,
              }}
              rowClassName={this.addHighlight}
              onChange={this.handleSearch}
              onRow={record => {
                return {
                  onClick: () => this.onRow(record),
                };
              }}
              dataSource={dataSource}
              columns={columns}
              scroll={{ x: tableScrollWidth(columns) }}
              loading={loading}
              hideDefaultSelections
              // rowSelection={rowSelection}
              pagination={{
                ...createPagination(roleAuth),
                simple: true,
              }}
            />
          </Col>
          <Col span={8}>
            {!isEmpty(selectedRow) ? (
              <React.Fragment>
                <Row>
                  <Col>
                    <div
                      style={{
                        marginTop: 55,
                        height: 48,
                        lineHeight: '48px',
                        borderRadius: '2px 2px 0 0',
                        textAlign: 'center',
                        border: '1px solid #e8e8e8',
                        borderBottomColor: '#cecece',
                        fontWeight: 'bold',
                        background: '#f5f5f5',
                      }}
                    >
                      {intl.get('hiam.roleManagement.view.title.authDims').d('权限值')}
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div
                      style={{
                        padding: '20px',
                        border: '1px solid #e8e8e8',
                        borderTopWidth: 0,
                        minHeight: 350,
                      }}
                    >
                      {authDim}
                    </div>
                  </Col>
                </Row>
              </React.Fragment>
            ) : null}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
