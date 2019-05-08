import React from 'react';
import { Form, Button, Input, Radio, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  @Bind()
  handleSearch() {
    const { form, search } = this.props;
    search(form.getFieldsValue());
  }

  @Bind()
  handleReset() {
    const { form, reset } = this.props;
    reset(form);
  }

  @Bind()
  handleTypeChange({ target: { value } }) {
    const { form, search } = this.props;
    search({ ...form.getFieldsValue(), nodeGroupType: value });
  }

  @Bind()
  render() {
    const { form, nodeGroupTypeList } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <Row>
          <Col>
            <FormItem>
              {getFieldDecorator('nodeGroupType', {
                initialValue: 'ALL_TYPE',
              })(
                <RadioGroup onChange={this.handleTypeChange}>
                  {nodeGroupTypeList.map(item => {
                    return (
                      <RadioButton value={item.value} key={item.value}>
                        {item.meaning}
                      </RadioButton>
                    );
                  })}
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <FormItem label="节点组名称">{getFieldDecorator('nodeGroupName')(<Input />)}</FormItem>
        <FormItem label="产品版本">
          {getFieldDecorator('productVersionNumber')(
            <Input inputChinese={false} typeCase="upper" />
          )}
        </FormItem>
        <FormItem label="服务编码">
          {getFieldDecorator('serviceCode')(<Input inputChinese={false} typeCase="upper" />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
