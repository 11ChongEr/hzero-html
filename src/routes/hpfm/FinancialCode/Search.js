import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

// hpfm 国际化前缀
const commonPrompt = 'hpfm.financialCode.view.message';
// 使用 FormItem 组件
const FormItem = Form.Item;
// 使用 Option 组件
const { Option } = Select;

// 通用表单布局
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
  }

  /**
   * handleSearch - 查询
   * @param {function} [onSearch] - 查询方法
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * handleReset - 重置表单
   * @param {*} form - 表单对象
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      typeList = [],
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={14}>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${commonPrompt}.financialCode`).d('代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('code')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${commonPrompt}.financialName`).d('名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('name')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get(`${commonPrompt}.financialType`).d('类型')}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                >
                  {getFieldDecorator('type')(
                    <Select mode="multiple">
                      {typeList.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} style={{ marginTop: '5px', marginLeft: '16px' }}>
            <Button htmlType="submit" type="primary" onClick={this.handleSearch}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button style={{ marginLeft: '8px' }} onClick={this.handleReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
