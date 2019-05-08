/**
 * template - 通用导入主页面
 * @since 2019-1-28
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, isTenantRoleLevel } from 'utils/utils';

import styles from './index.less';
import SheetTable from './SheetTable';

const { Option } = Select;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const modelPrompt = 'himp.template.model.template';
const viewMessagePrompt = 'himp.template.view.message';
const commonPrompt = 'hzero.common';

/**
 * 通用模板行页面
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['himp.template', 'entity.template'] })
@connect(({ template, loading }) => ({
  template,
  detailLoading: loading.effects['template/queryOneHeader'],
  saveLoading: loading.effects['template/update'] || loading.effects['template/create'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends PureComponent {
  state = {
    templateTypeCode: '',
  };

  componentDidMount() {
    this.queryHeader();
    this.fetchTemplateTypeCode();
    this.fetchImportSheetCode();
  }

  queryHeader() {
    const { dispatch, match, organizationId } = this.props;
    const { id } = match.params;
    if (id !== 'create') {
      dispatch({
        type: 'template/queryOneHeader',
        payload: {
          templateId: id,
          organizationId,
        },
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'template/updateState',
      payload: {
        headerData: {},
        templateTargetList: [],
      },
    });
  }

  /**
   * 保存，验证头数据和sheet行数据
   */
  @Bind()
  save() {
    const { form, dispatch, history, match, template } = this.props;
    const {
      params: { id },
    } = match;
    const { headerData = {}, templateTargetList = [] } = template;
    const editList = templateTargetList.filter(
      item => item._status === 'create' || item._status === 'update'
    );
    const params = getEditTableData(templateTargetList, ['id']);
    form.validateFields((err, values) => {
      if (!err) {
        // 可以单独保存头数据
        if (Array.isArray(params) && editList.length > 0) {
          if (params.length > 0) {
            dispatch({
              type: `template/${headerData.id !== undefined ? 'update' : 'create'}`,
              payload: {
                ...headerData,
                ...values,
                templateTargetList: params,
              },
            }).then(res => {
              if (res) {
                notification.success();
                if (id === 'create') {
                  history.push(`/himp/template/detail/${res.id}`);
                  this.queryHeader();
                } else {
                  this.queryHeader();
                }
              }
            });
          }
        } else {
          dispatch({
            type: `template/${headerData.id !== undefined ? 'update' : 'create'}`,
            payload: {
              ...headerData,
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              if (id === 'create') {
                history.push(`/himp/template/detail/${res.id}`);
              } else {
                this.queryHeader();
              }
            }
          });
        }
      }
    });
  }

  /**
   * fetchTemplateTypeCode - 查询层级<HIMP.TEMPLATE.TEMPLATETYPE>code
   * @return {Array}
   */
  @Bind()
  fetchTemplateTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'template/queryCode',
      payload: { lovCode: 'HIMP.TEMPLATE.TEMPLATETYPE' },
    });
  }

  @Bind()
  fetchImportSheetCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'template/queryCode',
      payload: { lovCode: 'HIMP.IMPORT_SHEET' },
    });
  }

  render() {
    const {
      detailLoading = false,
      saveLoading = false,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      template,
      match,
    } = this.props;
    const { templateTypeCode } = this.state;
    const {
      params: { id },
    } = match;
    const { headerData, code = {} } = template;
    const {
      templateCode,
      description,
      enabledFlag,
      prefixPatch,
      tenantId,
      tenantName,
      templateName = '',
      templateType = 'C',
    } = headerData;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.templateDetail`).d('导入模板管理明细')}
          backPath="/himp/template/list"
        >
          <Button onClick={this.save} type="primary" icon="save" loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Spin spinning={detailLoading}>
          <Content>
            <Form className={classNames(styles['template-form'])}>
              <Row gutter={6}>
                {!isTenantRoleLevel() && (
                  <Col span={6}>
                    <Form.Item
                      label={intl.get('hpfm.permission.model.permission.tenant').d('租户')}
                      {...formLayout}
                    >
                      {getFieldDecorator('tenantId', {
                        initialValue: tenantId,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
                            }),
                          },
                        ],
                      })(<Lov textValue={tenantName} code="HPFM.TENANT" />)}
                    </Form.Item>
                  </Col>
                )}
                <Col span={6}>
                  <Form.Item label={intl.get(`entity.template.name`).d('模板名称')} {...formLayout}>
                    {getFieldDecorator('templateName', {
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get(`${commonPrompt}.validation.requireInput`, {
                              name: intl.get(`entity.template.name`).d('模板名称'),
                            })
                            .d(`请输入${intl.get(`entity.template.name`).d('模板名称')}`),
                        },
                      ],
                      initialValue: templateName,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`entity.template.code`).d('模板代码')} {...formLayout}>
                    {getFieldDecorator('templateCode', {
                      initialValue: templateCode,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`entity.template.code`).d('模板代码'),
                          }),
                        },
                      ],
                    })(<Input disabled={match.params.id !== 'create'} inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`entity.template.type`).d('模板类型')} {...formLayout}>
                    {getFieldDecorator('templateType', {
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get(`${commonPrompt}.validation.requireInput`, {
                              name: intl.get(`entity.template.type`).d('模板类型'),
                            })
                            .d(`请输入${intl.get(`entity.template.type`).d('模板类型')}`),
                        },
                      ],
                      initialValue: templateType,
                    })(
                      <Select
                        onChange={val => {
                          this.setState({ templateTypeCode: val });
                          if (val === 'S') {
                            setFieldsValue({ prefixPatch: '' });
                          }
                        }}
                      >
                        {(code['HIMP.TEMPLATE.TEMPLATETYPE'] || []).map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.prefixPatch`).d('客户端路径前缀')}
                    {...formLayout}
                  >
                    {getFieldDecorator('prefixPatch', {
                      rules: [
                        { required: getFieldValue('templateType') === 'C', message: '请输入值' },
                      ],
                      initialValue: prefixPatch,
                    })(<Input disabled={getFieldValue('templateType') !== 'C'} />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.description`).d('描述')}
                    {...formLayout}
                  >
                    {getFieldDecorator('description', {
                      initialValue: description,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.status.enable`).d('启用')}
                    {...formLayout}
                  >
                    {getFieldDecorator('enabledFlag', {
                      initialValue: match.params.id === 'create' ? 1 : enabledFlag,
                    })(<Switch />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <SheetTable templateType={templateTypeCode || templateType} detailId={id} />
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}
