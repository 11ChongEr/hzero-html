/**
 * Detail - 值集视图编辑界面
 * @date: 2018-6-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Table, Col, Row, Input, Modal, InputNumber } from 'hzero-ui';
import { connect } from 'dva';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import DetailForm from './DetailForm';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * lov维护
 * @extends {Component} - React.Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} lovSetting - 数据源
 * @reactProps {Object} fetchLineLoading - 数据加载是否完成
 * @reactProps {Object} saveHeadLoading - 数据保存加载是否完成
 * @reactProps {Object} addLineLoading - 数据详情加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hpfm.lov', 'entity.tenant'],
})
@connect(({ lovSetting, loading }) => ({
  lovSetting,
  currentTenantId: getCurrentOrganizationId(),
  fetchLineLoading: loading.effects['lovSetting/fetchLine'],
  saveHeadLoading: loading.effects['lovSetting/saveHead'],
  addLineLoading: loading.effects['lovSetting/addLine'],
}))
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  /**
   *内部状态
   */
  state = {
    selectedRow: [],
    modalVisible: false,
    editRecordData: {},
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { match, dispatch } = this.props;
    const data = {
      viewHeaderId: match.params.id,
    };
    dispatch({
      type: 'lovSetting/fetchHead',
      payload: data,
    });
    dispatch({
      type: 'lovSetting/fetchLine',
      payload: {
        ...data,
      },
    });
  }

  /**
   *生成表头字段
   * @returns
   */
  @Bind()
  handlecolumns() {
    // op改造，通过层级控制平台级功能的使用，租户可编辑通用的功能
    // const { lovSetting: { headData = {} } } = this.props;
    // const { tenantId } = headData;
    // const notEditable = tenantId === 0 && isTenantRoleLevel();
    const notEditable = false;
    return [
      {
        title: intl.get('hpfm.lov.model.lov.fieldName').d('表格字段名'),
        dataIndex: 'fieldName',
        editable: true,
        width: 200,
        align: 'left',
        required: true,
        fieldLength: 30,
      },
      {
        title: intl.get('hpfm.lov.model.lov.display').d('表格列标题'),
        dataIndex: 'display',
        editable: true,
        required: true,
        fieldLength: 10,
      },
      {
        title: intl.get('hpfm.lov.model.lov.tableFieldWidth').d('列宽度'),
        dataIndex: 'tableFieldWidth',
        editable: true,
        width: 100,
        align: 'center',
        type: 'numberInput',
        required: true,
      },
      {
        title: intl.get('hpfm.lov.model.lov.orderSeq').d('列序号'),
        editable: true,
        dataIndex: 'orderSeq',
        width: 80,
        type: 'numberInput',
        align: 'center',
        required: true,
      },
      {
        title: intl.get('hpfm.lov.model.lov.queryFieldFlag').d('查询字段'),
        editable: true,
        dataIndex: 'queryFieldFlag',
        type: 'switch',
        defaultValue: 0,
        width: 100,
        align: 'center',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hpfm.lov.model.lov.tableFieldFlag').d('表格列'),
        editable: true,
        type: 'switch',
        defaultValue: 0,
        dataIndex: 'tableFieldFlag',
        width: 80,
        align: 'center',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        editable: true,
        type: 'switch',
        defaultValue: true,
        width: 80,
        dataIndex: 'enabledFlag',
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.edit').d('编辑'),
        width: 80,
        align: 'center',
        editable: false,
        render: (_, record) => {
          return notEditable ? (
            <div style={{ color: '#999' }}>{intl.get('hzero.common.button.edit').d('编辑')}</div>
          ) : (
            <a
              onClick={() => {
                this.showEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
  }

  /**
   * 删除行数据
   */
  @Bind()
  removeLineData() {
    const { dispatch } = this.props;
    const onOk = () => {
      dispatch({
        type: 'lovSetting/removeLineData',
        payload: this.state.selectedRow,
      }).then(response => {
        if (response) {
          this.refreshLine();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRow) {
    this.setState({ selectedRow });
  }

  /**
   * 刷新行数据
   */
  @Bind()
  refreshLine() {
    const {
      dispatch,
      lovSetting: { mainKey = {} },
    } = this.props;
    const data = {
      viewHeaderId: mainKey.viewHeaderId,
    };
    dispatch({
      type: 'lovSetting/fetchLine',
      payload: data,
    }).then(() => {
      this.setState({
        selectedRow: [],
      });
    });
  }

  /**
   * 添加行数据
   * @param {object} fieldsValue 表单数据
   * @param {object} form 当前表单
   */
  @Bind()
  handleAdd(fieldsValue, form) {
    const {
      dispatch,
      lovSetting: { mainKey = {} },
    } = this.props;
    const data = {
      ...mainKey,
      ...fieldsValue,
      queryFieldFlag: fieldsValue.queryFieldFlag ? 1 : 0,
      tableFieldFlag: fieldsValue.tableFieldFlag ? 1 : 0,
      enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
      tenantId: '0',
    };
    dispatch({
      type: 'lovSetting/addLine',
      payload: data,
      callback: () => {
        form.resetFields();
        this.refreshLine();
      },
    }).then(notification.success());
  }

  /**
   * 编辑
   * @param {object} fieldsValue 表单数据
   */
  @Bind()
  handleEditLineData(fieldsValue) {
    const {
      dispatch,
      lovSetting: { mainKey = {} },
    } = this.props;
    const { objectVersionNumber, viewLineId } = this.state.editRecordData;
    const data = {
      ...mainKey,
      ...fieldsValue,
      queryFieldFlag: fieldsValue.queryFieldFlag ? 1 : 0,
      tableFieldFlag: fieldsValue.tableFieldFlag ? 1 : 0,
      enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
      viewLineId,
      objectVersionNumber,
    };
    dispatch({
      type: 'lovSetting/editLineData',
      payload: data,
      callback: this.refreshLine,
    }).then(notification.success());
  }

  /**
   * hook事件 传入modal中
   * @param {object} form 表单
   * @param {object} editRecordData 当前编辑状态时的数据
   */
  @Bind()
  formHook(form, editRecordData) {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!editRecordData.viewLineId) {
          this.handleAdd(fieldsValue, form);
          this.showEditModal(false);
        } else {
          this.handleEditLineData(fieldsValue);
          form.resetFields();
          this.showEditModal(false);
        }
      }
    });
  }

  /**
   * 控制modal的显隐
   * @param {boolean} flag 显/隐标记
   * @param {object} record 行数据
   * @param {object} form 表单
   */
  @Bind()
  showEditModal(flag, record) {
    if (record) {
      this.setState({
        modalVisible: !!flag,
        editRecordData: record,
      });
    } else {
      this.setState({
        modalVisible: !!flag,
        editRecordData: {},
      });
    }
  }

  /**
   * 保存lov头信息
   */
  @Bind()
  saveHead() {
    const {
      match,
      dispatch,
      form,
      lovSetting: { headData = {} },
    } = this.props;
    const headKey = {
      viewHeaderId: match.params.id,
    };
    const callback = () => {
      notification.success();
      dispatch({
        type: 'lovSetting/fetchHead',
        payload: headKey,
      });
    };
    form.validateFields((err, fieldsValue) => {
      const data = {
        ...headData,
        ...fieldsValue,
        viewCode: lodash.trim(fieldsValue.viewCode),
        delayLoadFlag: fieldsValue.delayLoadFlag ? 1 : 0,
        enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
      };
      if (!err) {
        dispatch({
          type: 'lovSetting/saveHead',
          payload: data,
        }).then(response => {
          if (response) {
            callback();
          }
        });
      }
    });
  }

  /**
   * 分页切换
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const {
      dispatch,
      lovSetting: { mainKey = {} },
    } = this.props;
    dispatch({
      type: 'lovSetting/fetchLine',
      payload: {
        page: pagination,
        viewHeaderId: mainKey.viewHeaderId,
      },
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      match,
      currentTenantId,
      lovSetting: { rowData, headData },
      fetchLineLoading,
      saveHeadLoading,
      addLineLoading,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      viewCode,
      valueField,
      pageSize,
      viewName,
      displayField,
      title,
      height,
      delayLoadFlag,
      enabledFlag,
      lovId,
      lovName,
      childrenFieldName,
      tenantId,
      tenantName,
    } = headData;
    const { modalVisible, editRecordData, selectedRow } = this.state;
    // 当前租户是否和数据中的租户对应
    const isCurrentTenant = tenantId !== undefined ? tenantId !== currentTenantId : false;
    const basePath = match.path.substring(0, match.path.indexOf('/lov-list'));
    const dataSource = rowData.list;
    const columns = this.handlecolumns();
    const rowSelection = {
      // selectedRow: this.state.selectedRow,
      onChange: this.onSelectChange,
      selectedRowKeys: selectedRow.map(n => n.viewLineId),
    };
    const parentMethods = {
      handlecolumns: this.handlecolumns,
      formHook: this.formHook,
      showEditModal: this.showEditModal,
    };
    const notEditable = false;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.lov.view.message.title.lovSetting').d('值集视图配置')}
          backPath={`${basePath}/hpfm/lov-view/lov-view-list`}
        >
          {isCurrentTenant ? null : (
            <Button type="primary" loading={saveHeadLoading} onClick={this.saveHead}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          <Form layout="vertical" style={{ width: '1000px' }}>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.viewCode').d('视图代码')}>
                  {getFieldDecorator('viewCode', {
                    initialValue: viewCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.viewCode').d('视图代码'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(<Input typeCase="upper" trim inputChinese={false} disabled />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.valueField').d('值字段名')}>
                  {getFieldDecorator('valueField', {
                    initialValue: valueField,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.valueField').d('值字段名'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.displayField').d('显示字段名')}>
                  {getFieldDecorator('displayField', {
                    initialValue: displayField,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.displayField').d('显示字段名'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.lovId').d('值集')}>
                  {getFieldDecorator('lovId', {
                    initialValue: lovId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.lovId').d('值集'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      textValue={lovName}
                      disabled={isCurrentTenant}
                      code={isTenantRoleLevel() ? 'HPFM.LOV.LOV_DETAIL.ORG' : 'HPFM.LOV.LOV_DETAIL'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.viewName').d('视图名称')}>
                  {getFieldDecorator('viewName', {
                    initialValue: viewName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.viewName').d('视图名称'),
                        }),
                      },
                      {
                        max: 80,
                        message: intl.get('hzero.common.validation.max', {
                          max: 80,
                        }),
                      },
                    ],
                  })(<Input disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.childrenFieldName').d('子字段名')}>
                  {getFieldDecorator('childrenFieldName', {
                    initialValue: childrenFieldName,
                    rules: [
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label={intl.get('hpfm.lov.model.lov.title').d('标题')}>
                  {getFieldDecorator('title', {
                    initialValue: title,
                    rules: [
                      {
                        max: 20,
                        message: intl.get('hzero.common.validation.max', {
                          max: 20,
                        }),
                      },
                    ],
                  })(<Input disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              {!isTenantRoleLevel() && (
                <Col span={6}>
                  <FormItem label={intl.get('entity.tenant.name').d('租户名称')}>
                    {getFieldDecorator('tenantId', {
                      initialValue: tenantId,
                    })(<Lov code="HPFM.TENANT" disabled textValue={tenantName} />)}
                  </FormItem>
                </Col>
              )}
            </Row>
            <Row gutter={24}>
              <Col span={3}>
                <FormItem label={intl.get('hpfm.lov.model.lov.pageSize').d('页大小')}>
                  {getFieldDecorator('pageSize', {
                    initialValue: pageSize,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.pageSize').d('页大小'),
                        }),
                      },
                    ],
                  })(<InputNumber disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              {/* <Col span={3}> 注：暂时去掉
                <FormItem label={intl.get('hpfm.lov.model.lov.width').d('宽度')}>
                  {getFieldDecorator('width', {
                    initialValue: width,
                  })(<InputNumber />)}
                </FormItem>
              </Col> */}
              <Col span={3}>
                <FormItem label={intl.get('hpfm.lov.model.lov.height').d('高度')}>
                  {getFieldDecorator('height', {
                    initialValue: height,
                  })(<InputNumber disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem label={intl.get('hpfm.lov.model.lov.delayLoadFlag').d('加载延时')}>
                  {getFieldDecorator('delayLoadFlag', {
                    initialValue: delayLoadFlag === undefined ? 0 : delayLoadFlag,
                  })(<Switch disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
              <Col span={3}>
                <FormItem label={intl.get('hzero.common.status.enable').d('启用')}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: enabledFlag === undefined ? 0 : enabledFlag,
                  })(<Switch disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
          <div className="table-list-operator">
            {isCurrentTenant ? null : (
              <React.Fragment>
                <Button icon="plus" onClick={() => this.showEditModal(true)}>
                  {intl.get('hpfm.lov.view.detail.button.create').d('新增表格字段')}
                </Button>
                <Button
                  icon="minus"
                  onClick={this.removeLineData}
                  disabled={selectedRow.length <= 0}
                >
                  {intl.get('hpfm.lov.view.detail.button.delete').d('删除表格字段')}
                </Button>
              </React.Fragment>
            )}
          </div>
          <Table
            loading={fetchLineLoading}
            rowKey="viewLineId"
            dataSource={dataSource}
            columns={columns}
            bordered
            rowSelection={notEditable ? false : rowSelection}
            pagination={rowData.pagination || {}}
            onChange={this.handleStandardTableChange}
          />
          <DetailForm
            {...parentMethods}
            isCurrentTenant={isCurrentTenant}
            modalVisible={modalVisible}
            editRecordData={editRecordData}
            loading={addLineLoading}
          />
        </Content>
      </React.Fragment>
    );
  }
}
