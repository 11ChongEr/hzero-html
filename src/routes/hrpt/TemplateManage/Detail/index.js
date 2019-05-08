/**
 * templateManage - 报表平台/模板管理
 * @date: 2018-11-19
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs, Row, Col, Select, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, filter, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import TemplateLineTable from './TemplateLineTable';
import TemplateLineDrawer from './TemplateLineDrawer';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
/**
 * 模板管理-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} templateManage - 数据源
 * @reactProps {!Object} fetchApproveHeaderLoading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hrpt.templateManage', 'entity.tenant', 'entity.lang', 'entity.template'],
})
@Form.create({ fieldNameProp: null })
@connect(({ templateManage, global, loading }) => ({
  templateManage,
  global,
  tenantRoleLevel: isTenantRoleLevel(),
  fetchTemplateHeaderDetailLoading: loading.effects['templateManage/fetchTemplateHeaderDetail'],
  fetchTemplateLineLoading: loading.effects['templateManage/fetchTemplateLine'],
  saving:
    loading.effects['templateManage/createTemplateLine'] ||
    loading.effects['templateManage/editTemplateLine'],
  savingHeader:
    loading.effects['templateManage/createTemplateManage'] ||
    loading.effects['templateManage/editTemplateManage'],
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    templateLineDrawerVisible: false, // 列信息模态框
    templateLineSelectedRowKeys: [], // 列信息选中行
    isChangeTemplateType: false, // 是否改变模板类型
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'templateManage/fetchTemplateHeaderDetail',
        payload: {
          templateId: id,
        },
      });
      this.fetchTemplateLine();
    } else {
      dispatch({
        type: 'templateManage/updateState',
        payload: {
          header: {},
          line: {},
        },
      });
    }
    const lovCodes = {
      templateTypeCode: 'HRPT.TEMPLATE_TYPE', // 模板类型
    };
    // 初始化 值集
    dispatch({
      type: 'templateManage/batchCode',
      payload: {
        lovCodes,
      },
    });
    this.setState({
      isChangeTemplateType: false,
    });
  }

  /**
   * 查询行
   * @param {object} fields - 查询参数
   */
  @Bind()
  fetchTemplateLine(fields = {}) {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'templateManage/fetchTemplateLine',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        templateId: id,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      match,
      templateManage: { header = {} },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'templateManage/createTemplateManage', // 新增逻辑
            payload: { ...values },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hrpt/template-manage/detail/${res.templateId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'templateManage/editTemplateManage', // 更新逻辑
            payload: {
              ...header,
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      }
    });
  }

  /**
   * 模板明细行-新建打开滑窗
   */
  @Bind()
  handleAddTemplateLine() {
    this.setState({
      templateLineDrawerVisible: true,
    });
  }

  /**
   * 模板明细行-关闭滑窗
   */
  @Bind()
  handleCancelTemplateLine() {
    this.setState({
      templateLineDrawerVisible: false,
    });
    this.props.dispatch({
      type: 'templateManage/updateState',
      payload: { lineDetail: {}, fileList: [] },
    });
  }

  /**
   * 模板明细行-新增滑窗保存操作
   */
  @Bind()
  handleSaveTemplateLineContent(values) {
    const {
      dispatch,
      match,
      templateManage: { linePagination = {}, header = {} },
    } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'templateManage/createTemplateLine',
      payload: { ...values, templateId: id, tenantId: header.tenantId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleCancelTemplateLine();
        this.fetchTemplateLine(linePagination);
      }
    });
  }

  /**
   * 模板明细行-编辑打开滑窗
   */
  @Bind()
  handleEditTemplateLineContent(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'templateManage/fetchTemplateLineDetail',
      payload: { templateDtlId: record.templateDtlId },
    }).then(res => {
      if (res) {
        this.setState({
          templateLineDrawerVisible: true,
        });
      }
    });
  }

  /**
   * 模板明细行-编辑保存滑窗
   */
  @Bind()
  handleEditTemplateLineOk(values) {
    const {
      dispatch,
      match,
      templateManage: { linePagination = {}, lineDetail = {}, header = {} },
    } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'templateManage/editTemplateLine',
      payload: { ...lineDetail, ...values, templateId: id, tenantId: header.tenantId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleCancelTemplateLine();
        this.fetchTemplateLine(linePagination);
      }
    });
  }

  /**
   * 模板明细行-获取删除选中行
   */
  @Bind()
  handleMetaColumnsRowSelectChange(selectedRowKeys) {
    this.setState({ templateLineSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 模板明细行-批量删除
   */
  @Bind()
  handleDeleteTemplateLine() {
    const {
      dispatch,
      templateManage: { line = {}, linePagination },
    } = this.props;
    const { content = [] } = line;
    const { templateLineSelectedRowKeys } = this.state;
    const newParameters = filter(content, item => {
      return templateLineSelectedRowKeys.indexOf(item.templateDtlId) >= 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'templateManage/deleteTemplateLine',
          payload: { newParameters },
        }).then(res => {
          if (res) {
            notification.success();
            this.fetchTemplateLine(linePagination);
            this.setState({ templateLineSelectedRowKeys: [] });
          }
        });
      },
    });
  }

  /**
   * 改变模板类型
   */
  @Bind()
  changeTemplateTypeCode(val) {
    const {
      templateManage: { header = {} },
    } = this.props;
    if (header.templateTypeCode !== val) {
      this.setState({
        isChangeTemplateType: true,
      });
    } else {
      this.setState({
        isChangeTemplateType: false,
      });
    }
  }

  renderHeaderForm() {
    const {
      form: { getFieldDecorator },
      templateManage: {
        header = {},
        code: { templateTypeCode = [] },
        line = {},
      },
      match,
      tenantRoleLevel,
    } = this.props;
    const { content = [] } = line;
    return (
      <Form>
        <Row>
          {!tenantRoleLevel && (
            <Col span={8}>
              <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                {getFieldDecorator('tenantId', {
                  initialValue: header.tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.tenant.tag').d('租户'),
                      }),
                    },
                  ], // 校验规则
                })(
                  <Lov
                    code="HPFM.TENANT"
                    textValue={header.tenantName}
                    disabled={!isUndefined(header.tenantId)}
                  />
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item label={intl.get('entity.template.code').d('模板代码')} {...formLayout}>
              {getFieldDecorator('templateCode', {
                initialValue: header.templateCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.template.code').d('模板代码'),
                    }),
                  },
                ], // 校验规则
              })(
                <Input
                  typeCase="upper"
                  trim
                  inputChinese={false}
                  disabled={!isUndefined(header.templateCode)}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('entity.template.name').d('模板名称')} {...formLayout}>
              {getFieldDecorator('templateName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.template.name').d('模板名称'),
                    }),
                  },
                ],
                initialValue: header.templateName,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('entity.template.type').d('模板类型')} {...formLayout}>
              {getFieldDecorator('templateTypeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.template.type').d('模板类型'),
                    }),
                  },
                ],
                initialValue: header.templateTypeCode,
              })(
                <Select
                  allowClear
                  disabled={content.length !== 0}
                  onChange={
                    !isUndefined(match.params.id)
                      ? val => this.changeTemplateTypeCode(val)
                      : undefined
                  }
                >
                  {templateTypeCode &&
                    templateTypeCode.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
              {getFieldDecorator('remark', {
                initialValue: header.remark,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                initialValue: isUndefined(match.params.id) ? 1 : header.enabledFlag,
              })(<Switch />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      saving,
      match,
      fetchTemplateHeaderDetailLoading,
      fetchTemplateLineLoading,
      savingHeader,
      form,
      templateManage: { line = {}, linePagination = {}, lineDetail = {}, fileList = [] },
      global: { supportLanguage = [] },
    } = this.props;
    const {
      templateLineDrawerVisible = false,
      templateLineSelectedRowKeys = [],
      isChangeTemplateType = false,
    } = this.state;
    const templateLineRowSelection = {
      templateLineSelectedRowKeys,
      onChange: this.handleMetaColumnsRowSelectChange,
    };
    const templateTypeCodeValue = form.getFieldValue('templateTypeCode');
    const spinning = isUndefined(match.params.id) ? false : fetchTemplateHeaderDetailLoading;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hrpt.templateManage.view.message.title.add').d('模板管理 - 添加')
      : intl.get('hrpt.templateManage.view.message.title.edit').d('模板管理 - 编辑');
    const templateLineTitle = lineDetail.templateDtlId
      ? intl.get('hrpt.templateManage.view.message.templateLineDrawer.edit').d('编辑模板明细')
      : intl.get('hrpt.templateManage.view.message.templateLineDrawer.add').d('添加模板明细');
    const templateLineProps = {
      templateTypeCodeValue,
      templateLineRowSelection,
      supportLanguage,
      linePagination,
      loading: fetchTemplateLineLoading,
      dataSource: line.content,
      onEdit: this.handleEditTemplateLineContent,
      onChange: this.fetchTemplateLine,
    };
    const templateLineDrawerProps = {
      templateTypeCodeValue,
      templateLineTitle,
      supportLanguage,
      fileList,
      saving,
      anchor: 'right',
      visible: templateLineDrawerVisible,
      itemData: lineDetail,
      onOk: this.handleSaveTemplateLineContent,
      onCancel: this.handleCancelTemplateLine,
      onEditOk: this.handleEditTemplateLineOk,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hrpt/template-manage/list">
          <Button icon="save" type="primary" onClick={this.handleSave} loading={savingHeader}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={spinning}>
            {this.renderHeaderForm()}
            <div className="table-list-operator">
              <Button
                icon="plus"
                onClick={this.handleAddTemplateLine}
                disabled={isUndefined(match.params.id) || isChangeTemplateType === true}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="minus"
                onClick={this.handleDeleteTemplateLine}
                disabled={templateLineSelectedRowKeys.length === 0}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </div>
            <Tabs defaultActiveKey="templateLine">
              <Tabs.TabPane
                tab={intl.get('entity.template.detail').d('模板明细')}
                key="templateLine"
              >
                <TemplateLineTable {...templateLineProps} />
              </Tabs.TabPane>
            </Tabs>
            <TemplateLineDrawer {...templateLineDrawerProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
