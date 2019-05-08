/**
 * Message API返回消息管理
 * @date: 2019-1-9
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Row, Col, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  /**
   * 查询表单
   */
  @Bind()
  handleSearch() {
    const { form, search } = this.props;
    search(form);
  }

  /**
   * 重置表单
   */
  @Bind()
  handleReset() {
    const { form, reset } = this.props;
    reset(form);
  }

  render() {
    const { languageList, messageType } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.message.model.message.code').d('消息编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        max: 180,
                        message: intl.get('hzero.common.validation.max', {
                          max: 180,
                        }),
                      },
                    ],
                  })(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.message.model.message.type').d('消息类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('type')(
                    <Select allowClear>
                      {messageType.map(item => (
                        <Option value={item.meaning} key={item.meaning}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.message.model.message.lang').d('语言')}
                  {...formLayout}
                >
                  {getFieldDecorator('lang')(
                    <Select allowClear>
                      {languageList.map(item => (
                        <Option value={item.code} key={item.code}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.message.model.message.description').d('消息描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        max: 1000,
                        message: intl.get('hzero.common.validation.max', {
                          max: 1000,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
