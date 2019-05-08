import React from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  constructor(props) {
    super(props);
    // 调用父组件 props onRef 方法
    props.onRef(this);
  }

  /**
   * 查询操作
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  /**
   * 重置操作
   */
  @Bind()
  handleReset() {
    const { form, onReset } = this.props;
    onReset(form);
  }

  render() {
    const { form, languageList = [] } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('promptKey')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.prompt.model.prompt.promptCode').d('代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('promptCode')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.prompt.model.prompt.lang').d('语言')}
                  {...formLayout}
                >
                  {getFieldDecorator('lang')(
                    <Select allowClear>
                      {languageList.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
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
                  label={intl.get('hpfm.prompt.model.prompt.description').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description')(<Input />)}
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
