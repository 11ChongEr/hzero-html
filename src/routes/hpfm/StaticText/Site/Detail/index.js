/**
 * 静态文本管理 详情
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import { Button, Spin, Form, Select, Row, Col, Input, DatePicker } from 'hzero-ui';
import moment from 'moment';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';

import { getCurrentLanguage, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';

import StaticTextEditor from './StaticTextEditor';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const inputComponentPolyfillStyle = {
  width: '100%',
};

@connect(({ loading, staticText }) => {
  return {
    createStaticTextOneLoading: loading.effects['staticText/createStaticTextOne'],
    updateStaticTextOneLoading: loading.effects['staticText/updateStaticTextOne'],
    fetchStaticTextOneLoading: loading.effects['staticText/fetchStaticTextOne'],
    staticText: staticText.detail,
    lov: staticText.lov,
    currentLang: getCurrentLanguage(),
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['entity.company', 'entity.tenant', 'entity.lang', 'hpfm.staticText'],
})
export default class StaticTextDetail extends React.Component {
  state = {
    isCreate: true,
    isChildren: false,
    extraParams: {},
  };

  staticTextEditorRef;

  @Bind()
  getCompanyLovQueryParams() {
    const {
      form,
      staticText: { record: oriRecord = {} },
    } = this.props;
    const { isCreate = true } = this.state;
    const record = isCreate ? {} : oriRecord;
    return {
      tenantId: form.getFieldValue('tenantId') || record.tenantId,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'staticText/fetchLanguage',
    });
    this.initData();
  }

  render() {
    const { isCreate = true, isChildren, extraParams = {} } = this.state;
    const {
      staticText: { record: oriRecord = {} },
      lov: { language = [] },
      createStaticTextOneLoading,
      updateStaticTextOneLoading,
      fetchStaticTextOneLoading = false,
      form,
    } = this.props;
    const record = isCreate ? {} : oriRecord;
    const updateLoading = createStaticTextOneLoading || updateStaticTextOneLoading;
    const interactiveLoading = updateLoading || fetchStaticTextOneLoading || false;
    const addonCode = `${extraParams.parentTextCode || ''} ${
      extraParams.parentTextCode ? '.' : ''
    }`;
    const textCodeAddon = isChildren ? addonCode : undefined;
    const textCodeInitial = isCreate ? '' : (record.textCode || '').replace(addonCode, '');
    const companyDisabled = isUndefined(form.getFieldValue('tenantId') || record.tenantId);
    return (
      <Spin spinning={interactiveLoading}>
        <Header
          title={
            isCreate
              ? intl.get('hpfm.staticText.view.message.title.create').d('创建')
              : intl.get('hpfm.staticText.view.message.title.edit').d('编辑')
          }
          backPath="/hpfm/static-text/list"
        >
          <Button
            loading={updateLoading}
            icon="save"
            type="primary"
            onClick={this.handleSaveBtnClick}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <div>
            <span>{intl.get('entity.lang.tag').d('语言')}: </span>
            {form.getFieldDecorator('lang', {
              initialValue: record.lang || 'zh_CN',
            })(
              <Select onChange={this.handleChangeLanguage}>
                {language.map(n => (
                  <Select.Option key={n.code} value={n.code}>
                    {n.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>
        </Header>
        <Content>
          <Form>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hpfm.staticText.model.staticText.code').d('编码')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('textCode', {
                    initialValue: textCodeInitial,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.staticText.model.staticText.code').d('编码'),
                        }),
                      },
                    ],
                  })(
                    <Input
                      addonBefore={textCodeAddon}
                      typeCase="upper"
                      inputChinese={false}
                      disabled={!isCreate}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formItemLayout}>
                  {form.getFieldDecorator('tenantId', {
                    initialValue: record.tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.tenant.tag').d('租户'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={!isCreate}
                      code="HPFM.TENANT"
                      textField="tenantName"
                      textValue={record.tenantName}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('entity.company.tag').d('公司')} {...formItemLayout}>
                  {form.getFieldDecorator('companyId', {
                    initialValue: record.companyId,
                  })(
                    <Lov
                      disabled={companyDisabled}
                      code="HPFM.COMPANY"
                      textField="companyName"
                      textValue={record.companyName}
                      queryParams={this.getCompanyLovQueryParams}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hfpm.common.date.active.from').d('有效日期从')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('startDate', {
                    initialValue: record.startDate
                      ? moment(record.startDate)
                      : moment(moment(new Date()).format(DEFAULT_DATE_FORMAT)),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hfpm.common.date.active.from').d('有效日期从'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      format={getDateTimeFormat()}
                      showTime={{
                        defaultValue: moment('00:00:00', DEFAULT_TIME_FORMAT),
                      }}
                      disabledDate={currentDate =>
                        form.getFieldValue('endDate') &&
                        moment(form.getFieldValue('endDate')).isBefore(currentDate)
                      }
                      style={inputComponentPolyfillStyle}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hpfm.common.date.active.to').d('有效日期至')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('endDate', {
                    initialValue: record.endDate ? moment(record.endDate) : null,
                  })(
                    <DatePicker
                      format={getDateTimeFormat()}
                      showTime={{
                        defaultValue: moment('00:00:00', DEFAULT_TIME_FORMAT),
                      }}
                      disabledDate={currentDate =>
                        form.getFieldValue('startDate') &&
                        moment(form.getFieldValue('startDate')).isAfter(currentDate)
                      }
                      style={inputComponentPolyfillStyle}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hpfm.staticText.model.staticText.title').d('标题')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('title', {
                    initialValue: record.title,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.staticText.model.staticText.title').d('标题'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hpfm.staticText.model.staticText.description').d('描述')}
                  {...formItemLayout}
                >
                  {form.getFieldDecorator('description', {
                    initialValue: record.description,
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <StaticTextEditor
            content={isCreate ? undefined : record.text}
            onRef={this.handleStaticTextEditorRef}
          />
        </Content>
      </Spin>
    );
  }

  @Bind()
  fetchStaticTextOne(textId, lang) {
    const { dispatch } = this.props;
    dispatch({
      type: 'staticText/fetchStaticTextOne',
      payload: {
        textId,
        params: {
          lang,
        },
      },
    });
  }

  @Bind()
  initData() {
    const {
      match: { params },
      location: { search },
      currentLang = 'zh_CN',
    } = this.props;
    const { action = 'create' } = params || {};
    let isCreate = true;
    let isChildren = false;
    const extraParams = querystring.parse(search.substring(1));
    switch (action) {
      case 'create':
        if (extraParams.parentId) {
          isChildren = true;
        }
        break;
      case 'edit':
        isCreate = false;
        break;
      default:
        break;
    }
    if (!isCreate) {
      this.fetchStaticTextOne(extraParams.textId, currentLang);
    }
    // 设置 当前编辑的 静态文本的状态
    this.setState({
      isCreate,
      isChildren,
      extraParams,
    });
  }

  @Bind()
  handleChangeLanguage(lang) {
    const { form } = this.props;
    const { isCreate = true, extraParams } = this.state;
    if (!isCreate) {
      form.resetFields();
      this.fetchStaticTextOne(extraParams.textId, lang);
    }
  }

  @Bind()
  getEditData() {
    if (!this.staticTextEditorRef) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      const { form } = this.props;
      form.validateFields((err, fieldsValue) => {
        if (err) {
          reject();
        } else {
          const { content } = this.staticTextEditorRef.state;
          if (!content) {
            return notification.warning({
              message: intl
                .get('hpfm.staticText.view.message.alert.contentRequired')
                .d('请输入静态文本内容'),
            });
          }
          resolve({
            ...fieldsValue,
            text: content,
            startDate: fieldsValue.startDate
              ? fieldsValue.startDate.format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            endDate: fieldsValue.endDate
              ? fieldsValue.endDate.format(DEFAULT_DATETIME_FORMAT)
              : undefined,
          });
        }
      });
    });
  }

  @Bind()
  handleSaveBtnClick() {
    const { isCreate } = this.state;
    this.getEditData().then(
      data => {
        const { dispatch } = this.props;
        const { extraParams = {}, isChildren } = this.state;
        let updatePromise;
        if (isCreate) {
          const params = {};
          if (isChildren) {
            params.parentId = extraParams.parentId;
            if (!data.textCode.startsWith(extraParams.parentTextCode)) {
              params.textCode = `${extraParams.parentTextCode || ''}${
                extraParams.parentTextCode ? '.' : ''
              }${data.textCode}`;
            }
          }
          updatePromise = dispatch({
            type: 'staticText/createStaticTextOne',
            payload: {
              params: {
                ...data,
                ...params,
              },
            },
          });
        } else {
          const {
            staticText: { record },
          } = this.props;
          const params = {};
          if (isChildren) {
            params.textCode = `${extraParams.parentTextCode || ''}${
              extraParams.parentTextCode ? '.' : ''
            }${data.textCode}`;
          }
          updatePromise = dispatch({
            type: 'staticText/updateStaticTextOne',
            payload: {
              params: {
                ...record,
                ...data,
                ...params,
              },
            },
          });
        }
        updatePromise.then(res => {
          if (res) {
            notification.success();
            this.reloadAfterSave(res);
          }
        });
      },
      () => {
        // 表单或者 编辑组件内部已经报错了
      }
    );
  }

  @Bind()
  handleStaticTextEditorRef(staticTextEditorRef) {
    this.staticTextEditorRef = staticTextEditorRef;
  }

  @Bind()
  reloadAfterSave(res) {
    const { extraParams } = this.state;
    this.setState({
      isCreate: false,
      extraParams: {
        ...extraParams,
        ...res,
      },
    });
    this.fetchStaticTextOne(res.textId, res.lang);
  }
}
