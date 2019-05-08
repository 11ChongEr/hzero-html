/**
 * MessageTemplate - 消息模板明细维护
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Row, Col, Select, Cascader, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';
import TinymceEditor from 'components/TinymceEditor';
import Lov from 'components/Lov';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'utils/utils';

import styles from './index.less';

/**
 * 消息模板明细组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageTemplate - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} detailLoading - 明细数据加载
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ messageTemplate, loading }) => ({
  messageTemplate,
  loading:
    loading.effects['messageTemplate/updateTemplate'] ||
    loading.effects['messageTemplate/addTemplate'],
  detailLoading: loading.effects['messageTemplate/fetchDetail'],
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hmsg.messageTemplate', 'entity.tenant', 'entity.lang'] })
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      flag: false,
      spinning: !isUndefined(props.match.params.id),
    };
  }

  /**
   * componentDidMount
   * render()调用后获取页面数据信息
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'messageTemplate/fetchDetail',
        payload: {
          templateId: id,
        },
      });
    }
    dispatch({
      type: 'messageTemplate/fetchType',
    });
    dispatch({
      type: 'messageTemplate/fetchLanguage',
    });
  }

  /**
   * 保存
   */
  @Bind()
  handelSaveOption() {
    const { form, dispatch, messageTemplate } = this.props;
    const { detail = {} } = messageTemplate;
    form.validateFields((err, values) => {
      if (!err && values.templateContent !== '') {
        // 校验通过，进行保存操作
        let type = 'messageTemplate/updateTemplate'; // 默认操作：更新
        if (!detail.templateId) {
          // 新建
          type = 'messageTemplate/addTemplate';
        }
        const { categoryCode, ...others } = values;
        dispatch({
          type,
          payload: {
            ...detail,
            ...others,
            messageCategoryCode: categoryCode[0],
            messageSubcategoryCode: categoryCode[1],
          },
        }).then(res => {
          if (res) {
            notification.success();
            if (!detail.templateId) {
              dispatch(
                routerRedux.push({
                  pathname: `/hmsg/message-template/detail/${res.templateId}`,
                })
              );
            }
            // this.handleSearch();
            dispatch({
              type: 'messageTemplate/updateState',
              payload: { detail: res },
            });
          }
        });
        this.setState({
          flag: false,
        });
      } else {
        this.setState({
          flag: false,
        });
        if (values.templateContent === '' || isUndefined(values.templateContent)) {
          this.setState({
            flag: true,
          });
        }
      }
    });
  }

  @Bind()
  onRichTextEditorChange(dataSource) {
    const {
      dispatch,
      messageTemplate: { detail },
    } = this.props;
    dispatch({
      type: 'messageTemplate/updateState',
      payload: {
        detail: {
          ...detail,
          templateContent: dataSource,
        },
      },
    });
    if (dataSource === '') {
      this.setState({
        flag: true,
      });
    } else {
      this.setState({
        flag: false,
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      messageTemplate,
      loading,
      detailLoading,
      tenantRoleLevel,
    } = this.props;
    const { detail = {}, language = [], categoryTree = [] } = messageTemplate;
    const { flag, spinning } = this.state;
    const tinymceEditorProps = {
      content: detail.templateContent || '',
      onChange: this.onRichTextEditorChange,
    };
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const prefix = `hmsg.messageTemplate.model.template`;
    return (
      <Fragment>
        <Header
          title={intl.get('hmsg.messageTemplate.view.message.title.detail').d('消息模板明细')}
          backPath="/hmsg/message-template/list"
        >
          <Button onClick={this.handelSaveOption} type="primary" icon="save" loading={loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={spinning ? detailLoading : null}>
            <Form className={classNames(styles['template-form'])}>
              <Row gutter={24}>
                {!tenantRoleLevel && (
                  <Col span={9}>
                    <Form.Item label={intl.get(`entity.tenant.tag`).d('租户')} {...formLayout}>
                      {getFieldDecorator('tenantId', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`entity.tenant.tag`).d('租户'),
                            }),
                          },
                        ],
                        initialValue: detail.tenantId,
                      })(
                        <Lov
                          disabled={!isUndefined(detail.tenantId)}
                          code="HPFM.TENANT"
                          textValue={detail.tenantName}
                        />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={9}>
                  <Form.Item
                    label={intl.get(`${prefix}.templateCode`).d('消息模板代码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('templateCode', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prefix}.templateCode`).d('消息模板代码'),
                          }),
                        },
                      ],
                      initialValue: detail.templateCode,
                    })(
                      <Input
                        trim
                        typeCase="upper"
                        inputChinese={false}
                        disabled={!isUndefined(detail.templateCode)}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    label={intl.get(`${prefix}.templateName`).d('消息模板名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('templateName', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prefix}.templateName`).d('消息模板名称'),
                          }),
                        },
                      ],
                      initialValue: detail.templateName,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    label={intl.get(`${prefix}.templateTitle`).d('消息模板标题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('templateTitle', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prefix}.templateTitle`).d('消息模板标题'),
                          }),
                        },
                      ],
                      initialValue: detail.templateTitle,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item label={intl.get(`entity.lang.tag`).d('语言')} {...formLayout}>
                    {getFieldDecorator('lang', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`entity.lang.tag`).d('语言'),
                          }),
                        },
                      ],
                      initialValue: detail.lang,
                    })(
                      <Select>
                        {language.map(item => (
                          <Select.Option key={item.code} value={item.code}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    label={intl.get(`${prefix}.externalCode`).d('外部编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('externalCode', {
                      rules: [
                        {
                          required: true && getFieldValue('templateTypeCode') === 'SMS',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prefix}.externalCode`).d('外部编码'),
                          }),
                        },
                      ],
                      initialValue: detail.externalCode,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    label={intl.get(`${prefix}.subcategoryCode`).d('消息子类型')}
                    {...formLayout}
                  >
                    {getFieldDecorator('categoryCode', {
                      initialValue: [detail.messageCategoryCode, detail.messageSubcategoryCode],
                    })(
                      <Cascader
                        fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                        options={categoryTree}
                        expandTrigger="hover"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    label={intl.get('hzero.common.status.enable').d('启用')}
                    {...formLayout}
                  >
                    {getFieldDecorator('enabledFlag', {
                      initialValue: isUndefined(detail.enabledFlag) ? 1 : detail.enabledFlag,
                    })(<Switch />)}
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    label={
                      <span className={styles.templateContentLabel}>
                        {intl.get(`${prefix}.templateContent`).d('消息模板内容')}
                      </span>
                    }
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    className={flag ? styles.templateContent : ''}
                  >
                    {getFieldDecorator('templateContent', {
                      initialValue: detail.templateContent,
                    })(<TinymceEditor {...tinymceEditorProps} />)}
                    <span hidden={!flag} className={styles.templateContentError}>
                      {intl
                        .get('hmsg.messageTemplate.model.validation.notNull')
                        .d('消息模板内容不能为空')}
                    </span>
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    label={intl.get(`${prefix}.sqlValue`).d('SQL')}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    {getFieldDecorator('sqlValue', {
                      initialValue: detail.sqlValue,
                    })(<Input.TextArea autosize={{ minRows: 5, maxRows: 7 }} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
