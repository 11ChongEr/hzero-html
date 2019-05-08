/**
 * EditModal
 * @description
 * @author WY yang.wang06@hand-china.com
 * @date 2018/10/11
 */

import React from 'react';

import { Affix, Col, Modal, Row, Form, Input, Button, Select, Popconfirm } from 'hzero-ui';
import { filter, forEach, map, cloneDeep, isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';

import styles from '../index.less';

const { Item: FormItem } = Form;

@Form.create({ fieldNameProp: null })
export default class EditModal extends React.Component {
  containerRef = React.createRef();

  state = {
    dataSource: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.profileValue !== prevState.profileValue) {
      const { profileValue = {} } = nextProps;
      return {
        profileValue: nextProps.profileValue,
        dataSource: cloneDeep(profileValue.profileValueDTOList || []).map(record => ({
          ...record,
          _status: 'update',
        })),
      };
    }
    return null;
  }

  render() {
    const { profileValue, ...modalProps } = this.props;
    const { dataSource } = this.state;
    return (
      <Modal
        {...modalProps}
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={this.handleCloseModal}
        onOk={this.handleOkBtnClick}
      >
        <div ref={this.containerRef}>
          <Content>
            <Affix target={this.getEditModalContentContainer}>{this.renderProfileForm()}</Affix>
            <Row type="flex">
              <Col span={3} />
              <Col span={21}>
                <EditTable
                  dataSource={dataSource}
                  columns={this.getColumns()}
                  pagination={false}
                  rowKey="profileValueId"
                  bordered
                />
              </Col>
            </Row>
          </Content>
        </div>
      </Modal>
    );
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getEditModalContentContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getEditModalContentContainer() {
    const parent = this.getParent(this.containerRef.current);
    return parent || document.body;
  }

  @Bind()
  getColumns() {
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('hmfm.profile.model.profileValue.levelCode').d('层级'),
          dataIndex: 'levelCode',
          width: 100,
          render: (item, record) => {
            // 当时平台级时,levelCode,levelValue 固定是 GLOBAL,且不能修改
            const { levelCode = [] } = this.props;
            const { $form } = record;
            const isSiteLevel = this.getCurrentProfileLevel() === 'P';
            return (
              <FormItem required help className={styles['full-width']}>
                {$form.getFieldDecorator('levelCode', {
                  initialValue: item,
                  rules: [{ required: true }],
                })(
                  <ValueList
                    options={levelCode}
                    onChange={value => this.handleRecordLevelCodeChange(value, record)}
                    className={styles['full-width']}
                    disabled={isSiteLevel}
                  />
                )}
              </FormItem>
            );
          },
        },
        {
          title: intl.get('hmfm.profile.model.profileValue.levelValue').d('层级值'),
          dataIndex: 'levelValue',
          width: 200,
          render: (item, record) => {
            const { $form } = record;
            const tenantId = this.getCurrentTenantId();
            const isSiteLevel = tenantId === undefined;
            const currentLevelCode = $form.getFieldValue('levelCode');
            // 当时平台级时,levelCode,levelValue 固定是 GLOBAL,且不能修改
            let $levelValueInputComponent;
            switch (currentLevelCode) {
              case 'USER':
                $levelValueInputComponent = (
                  <Lov
                    disabled={isSiteLevel}
                    textValue={record.levelValueDescription}
                    code="HIAM.TENANT.USER"
                    onChange={value => this.handleRecordChange(value, record)}
                    queryParams={{ organizationId: tenantId }}
                    style={{ width: 200 }}
                  />
                );
                break;
              case 'ROLE':
                $levelValueInputComponent = (
                  <Lov
                    disabled={tenantId === undefined}
                    textValue={record.levelValueDescription}
                    code="HIAM.TENANT.ROLE"
                    onChange={value => this.handleRecordChange(value, record)}
                    queryParams={{ organizationId: tenantId }}
                    style={{ width: 200 }}
                  />
                );
                break;
              case 'GLOBAL':
                // 如果层级是 GLOBAL 那么层级值 只能是 GLOBAL
                $levelValueInputComponent = (
                  <Select style={{ width: 200 }} disabled>
                    <Select.Option value="GLOBAL" key="GLOBAL">
                      {intl.get('hmfm.profile.model.profileValue.levelValue.GLOBAL').d('全局')}
                    </Select.Option>
                  </Select>
                );
                break;
              default:
                // 没有选择 层级 是不能选择层级值的.
                $levelValueInputComponent = <Input disabled />;
                break;
            }
            return (
              <FormItem required help className={styles['full-width']}>
                {$form.getFieldDecorator('levelValue', {
                  initialValue: item,
                  rules: [{ required: true }],
                })($levelValueInputComponent)}
              </FormItem>
            );
          },
        },
        {
          title: intl.get('hmfm.profile.model.profileValue.profileValue').d('配置值'),
          dataIndex: 'value',
          width: 200,
          render: (item, record) => {
            const { $form } = record;
            return (
              <FormItem className={styles['full-width']} required help>
                {$form.getFieldDecorator('value', {
                  initialValue: item,
                  rules: [{ required: true }],
                })(<Input onChange={e => this.handleRecordChange(e.target.value, record)} />)}
              </FormItem>
            );
          },
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          render: (_, record) => {
            const isTenantLevel = this.getCurrentProfileLevel() === 'T';
            return (
              <React.Fragment>
                {isTenantLevel && (
                  <Popconfirm
                    placement="topRight"
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                    onConfirm={() => {
                      this.handleRecordRemove(record);
                    }}
                  >
                    <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                  </Popconfirm>
                )}
              </React.Fragment>
            );
          },
        },
      ];
    }
    return this.columns;
  }

  @Bind()
  renderProfileForm() {
    const { profileValue = {}, form, isCreate, level = [] } = this.props;
    const isTenantLevel = this.getCurrentProfileLevel() === 'T'; // 维度选择的租户
    return (
      <React.Fragment>
        <Row style={{ backgroundColor: '#fff' }}>
          <Col md={12} sm={24}>
            <FormItem
              required
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label={intl.get('hmfm.profile.model.profile.name').d('配置编码')}
            >
              {form.getFieldDecorator('profileName', {
                initialValue: profileValue.profileName,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.profile.model.profile.name').d('配置编码'),
                      })
                      .d('配置名称不能为空'),
                  },
                ],
              })(<Input disabled={!isCreate} typeCase="upper" inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label={intl.get('hpfm.profile.model.profile.description').d('配置描述')}
            >
              {form.getFieldDecorator('description', {
                initialValue: profileValue.description,
              })(<Input />)}
            </FormItem>
          </Col>
          <React.Fragment>
            <Col md={12} sm={24}>
              <FormItem
                required
                label={intl.get('hpfm.profile.model.profile.level').d('维度')}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
              >
                {form.getFieldDecorator('profileLevel', {
                  initialValue: profileValue.profileLevel,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.profile.model.profile.level').d('维度'),
                        })
                        .d('维度不能为空'),
                    },
                  ],
                })(
                  <ValueList
                    className={styles['full-width']}
                    disabled={!isCreate}
                    options={level}
                    onChange={this.handleProfileLevelChange}
                  />
                )}
              </FormItem>
            </Col>
            {isTenantLevel && (
              <Col md={12} sm={24}>
                <FormItem
                  required
                  label={intl.get('hpfm.profile.model.profile.tenant').d('租户')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  {form.getFieldDecorator('tenantId', {
                    initialValue: profileValue.tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.profile.model.profile.tenant').d('租户'),
                          })
                          .d('租户不能为空'),
                      },
                    ],
                  })(
                    <Lov
                      textValue={profileValue.tenantName}
                      style={{ width: 250 }}
                      disabled={!isCreate}
                      code="HPFM.TENANT"
                      onChange={this.handleProfileTenantIdChange}
                    />
                  )}
                </FormItem>
              </Col>
            )}
          </React.Fragment>
        </Row>
        <Row style={{ backgroundColor: '#fff' }}>
          <Col>
            <FormItem
              label={intl.get('hmfm.profile.model.profile.profileValue').d('配置值')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
            >
              <Button disabled={!isTenantLevel} onClick={this.handleRecordAddBtnClick}>
                {intl.get('hmfm.profile.view.form.create').d('新增配置值')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  @Bind()
  handleCloseModal() {
    const { form, onCancel } = this.props;
    form.resetFields();
    onCancel();
  }

  @Bind()
  getCurrentProfileLevel() {
    const { isCreate } = this.props;
    if (isCreate) {
      const { form } = this.props;
      return form.getFieldValue('profileLevel');
    }
    const { profileValue = {} } = this.props;
    return profileValue.profileLevel;
  }

  @Bind()
  getCurrentTenantId() {
    const { isCreate } = this.props;
    if (isCreate) {
      const { form } = this.props;
      return form.getFieldValue('tenantId');
    }
    const { profileValue = {} } = this.props;
    return profileValue.tenantId;
  }

  @Bind()
  handleProfileLevelChange(profileLevel) {
    const { isCreate } = this.props;
    if (isCreate) {
      if (profileLevel === 'T') {
        // 从平台变为租户
      } else if (profileLevel === 'P') {
        // 从租户变为平台
        const { dataSource } = this.state;
        const { profileValue = {}, form } = this.props;
        const profileValues = [];
        forEach(dataSource, record => {
          if (record.value) {
            profileValues.push(record.value);
          }
        });
        // 变为 平台级
        this.setState({
          dataSource: [
            {
              _status: 'create',
              levelCode: 'GLOBAL',
              levelValue: 'GLOBAL',
              value: profileValues.join(' '),
              updateStatus: 'create',
              profileValueId: uuid(),
              profileId: profileValue.profileId,
            },
          ],
        });
        // 变为平台级后 没有租户
        form.setFieldsValue({ tenantId: undefined });
      }
    }
  }

  /**
   * handleRecordAddBtnClick-配置值新增按钮点击
   */
  @Bind()
  handleRecordAddBtnClick() {
    const { isCreate, profileValue } = this.props;
    const { dataSource } = this.state;
    const nRecord = {
      updateStatus: 'create',
      _status: 'create',
      profileValueId: uuid(),
    };
    const profileLevel = this.getCurrentProfileLevel();
    if (profileLevel === 'P') {
      if (!isEmpty(dataSource)) {
        // 如果dataSource 不为空, 则只能存在一条数据
        notification.warning({
          message: intl
            .get('hmfm.profile.message.valid.operate')
            .d('当维度为平台时,只能添加一条GLOBAL层级的配置值'),
        });
        return;
      }
      // 如果维度是平台,则levelCode 与 levelValue 只能是 GLOBAL
      nRecord.levelCode = 'GLOBAL';
      nRecord.levelValue = 'GLOBAL';
    }
    if (!isCreate) {
      nRecord.profileId = profileValue.profileId;
    }
    this.setState({
      dataSource: [...dataSource, nRecord],
    });
  }

  // columns's method

  /**
   * handleRecordLevelCodeChange - 配置值的层级更改
   * @param {*} value 修改的值
   * @param {Object} updateRecord 修改的配置值
   */
  @Bind()
  handleRecordLevelCodeChange(value, updateRecord) {
    const { $form } = updateRecord;
    // 不需要更新 页面, 只需要更新标志位
    // eslint-disable-next-line
    updateRecord.updateStatus = 'update';
    switch (value) {
      case 'ROLE':
      case 'USER':
        $form.setFieldsValue({
          levelValue: undefined,
        });
        break;
      case 'GLOBAL':
      default:
        $form.setFieldsValue({
          levelValue: 'GLOBAL',
        });
        break;
    }
  }

  /**
   * handleRecordChange - 更新 record 的 updateStatus 标志为编辑
   * @param {*}       value 更新的值
   * @param {Object}  updateRecord 更新的记录
   */
  @Bind()
  handleRecordChange(value, updateRecord) {
    // 不需要更新 页面, 只需要更新标志位
    // eslint-disable-next-line
    updateRecord.updateStatus = 'update';
  }

  /**
   * handleRecordRemove-配置值单条删除
   * 新建的    直接删除
   * 服务端的  调接口成功后从dataSource删除
   * @param {Object} removeRecord 即将删除的配置值
   */
  @Bind()
  handleRecordRemove(removeRecord) {
    const { onRecordRemove } = this.props;
    const { dataSource } = this.state;
    // eslint-disable-next-line no-underscore-dangle
    if (removeRecord._status === 'create') {
      // 如果是新建的,直接删除
      this.setState({
        dataSource: filter(dataSource, r => {
          return r.profileValueId !== removeRecord.profileValueId;
        }),
      });
    } else {
      // 如果是之前存在的,调接口删除
      onRecordRemove(removeRecord).then(response => {
        if (response) {
          this.setState({
            dataSource: filter(dataSource, r => {
              return r.profileValueId !== removeRecord.profileValueId;
            }),
          });
        }
      });
    }
  }

  @Bind()
  handleOkBtnClick() {
    const { isCreate, form, onOk } = this.props;
    const { dataSource } = this.state;
    let saveProfile = {};
    const profileLevel = this.getCurrentProfileLevel();
    let hasLineError = false;
    let hasHeadError = true;
    if (isCreate) {
      // 新增的
      form.validateFields((err, fields) => {
        if (!err) {
          hasHeadError = false;
          saveProfile.profileName = fields.profileName;
          saveProfile.description = fields.description;
          saveProfile.profileLevel = fields.profileLevel;

          const saveDataSource = getEditTableData(dataSource, ['profileValueId', 'updateStatus']);
          if (saveDataSource.length !== 0 && saveDataSource.length !== dataSource.length) {
            hasLineError = true;
            return; // 有错误退出后续代码
          }
          if (profileLevel === 'P') {
            // 平台级
            saveProfile.profileValueList = [
              {
                levelCode: saveDataSource[0].levelCode,
                levelValue: saveDataSource[0].levelValue,
                value: saveDataSource[0].value,
              },
            ];
          } else {
            // 租户级
            saveProfile.tenantId = fields.tenantId;
            saveProfile.profileValueList = map(saveDataSource, profileValue => {
              return {
                levelCode: profileValue.levelCode,
                levelValue: profileValue.levelValue,
                value: profileValue.value,
              };
            });
          }
        }
      });
    } else {
      const { profileValue } = this.props;
      form.validateFields((err, fields) => {
        if (!err) {
          hasHeadError = false;
          saveProfile = { ...profileValue };
          saveProfile.description = fields.description;
          if (profileLevel === 'P') {
            const editDataSource = filter(dataSource, r => r.updateStatus);
            const saveDataSource = getEditTableData(editDataSource, ['updateStatus']);
            if (saveDataSource.length !== 0 && saveDataSource.length !== editDataSource.length) {
              hasLineError = true;
              return;
            }
            saveProfile.profileValueList = [...saveDataSource];
          } else {
            // 租户级
            saveProfile.tenantId = profileValue.tenantId;
            const editDataSource = filter(dataSource, r => r.updateStatus);
            const saveDataSource = getEditTableData(editDataSource, [
              'profileValueId',
              'updateStatus',
            ]);
            if (saveDataSource.length !== 0 && saveDataSource.length !== editDataSource.length) {
              hasLineError = true;
              return;
            }
            saveProfile.profileValueList = saveDataSource;
          }
        }
      });
    }
    if (hasLineError) {
      notification.error({
        message: intl
          .get('hmfm.profile.message.valid.error')
          .d('数据校验失败: 层级,层级值,配置值 是必输的'),
      });
    } else if (!hasHeadError) {
      onOk(saveProfile);
    }
  }
}
