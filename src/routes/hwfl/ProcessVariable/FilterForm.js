import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 流程变量查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {};

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, onStore } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行search
          onSearch();
          onStore(values);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      typeList,
      category,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.class').d('流程分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('category', {})(
                    <Select allowClear>
                      {category &&
                        category.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('hwfl.processVariable.model.processVariable.parameterType')
                    .d('变量类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('parameterType', {})(
                    <Select allowClear>
                      {typeList &&
                        typeList.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.common.code').d('编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('code', {})(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row span={8}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.common.description').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {})(<Input />)}
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
    );
  }
}
