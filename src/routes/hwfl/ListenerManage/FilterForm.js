import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import moment from 'moment';

import intl from 'utils/intl';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;
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
    const { getFieldDecorator } = this.props.form;
    const { category = [], listenerTypeList = [] } = this.props;
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hwfl.listenerManage.model.listenerManage.type')
                      .d('监听器类型')}
                    {...formlayout}
                  >
                    {getFieldDecorator('type', {})(
                      <Select allowClear>
                        {listenerTypeList.map(item => (
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
                      .get('hwfl.listenerManage.model.listenerManage.code')
                      .d('监听器编码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('code', {})(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hwfl.listenerManage.model.listenerManage.name')
                      .d('监听器名称')}
                    {...formlayout}
                  >
                    {getFieldDecorator('name', {})(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hwfl.common.model.process.class').d('流程分类')}
                    {...formlayout}
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
                    label={intl.get('hwfl.listenerManage.model.listenerManage.event').d('监听事件')}
                    {...formlayout}
                  >
                    {getFieldDecorator('event', {})(<Input />)}
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
