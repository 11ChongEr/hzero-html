import React from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class SagaFilter extends React.Component {
  constructor(props) {
    super(props);
    // 调用父组件 props onRef 方法
    props.onRef(this);
  }

  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  render() {
    const { form, statusList = [] } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <Form>
          <Row>
            <Col span={6}>
              <FormItem label="状态" {...formLayout}>
                {getFieldDecorator('status')(
                  <Select style={{ width: '100%' }} allowClear>
                    {statusList.map(item => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="事务实例" {...formLayout}>
                {getFieldDecorator('sagaCode')(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="关联事务类型" {...formLayout}>
                {getFieldDecorator('refType')(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem {...formLayout}>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <FormItem label="关联业务ID" {...formLayout}>
                {getFieldDecorator('refId')(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
