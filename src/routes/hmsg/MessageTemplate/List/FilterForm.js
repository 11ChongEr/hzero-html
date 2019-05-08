import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';

/**
 * 消息模板列表查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/hmsg/message-template' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { language, form, tenantRoleLevel } = this.props;
    const { getFieldDecorator } = form;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                {!tenantRoleLevel && (
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formlayout}>
                      {getFieldDecorator('tenantId', {})(
                        <Lov code="HPFM.TENANT" textField="tenantName" />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hmsg.messageTemplate.model.template.templateCode')
                      .d('消息模板代码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('templateCode', {})(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hmsg.messageTemplate.model.template.templateName')
                      .d('消息模板名称')}
                    {...formlayout}
                  >
                    {getFieldDecorator('templateName', {})(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label={intl.get('entity.lang.tag').d('语言')} {...formlayout}>
                    {getFieldDecorator('lang', {})(
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
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
