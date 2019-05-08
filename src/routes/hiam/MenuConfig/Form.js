import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const tenantRoleLevel = isTenantRoleLevel();

@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  onClick() {
    const {
      handleQueryList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    handleQueryList({
      ...data,
    });
  }

  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
      levelCode,
    } = this.props;
    const levelCodeList = (levelCode && levelCode.filter(o => o.value !== 'org')) || [];
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.name`).d('目录/菜单')} {...formLayout}>
                  {getFieldDecorator('name')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.parentName`).d('上级目录')}
                  {...formLayout}
                >
                  {getFieldDecorator('parentName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.quickIndex`).d('快速索引')}
                  {...formLayout}
                >
                  {getFieldDecorator('quickIndex')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            {!tenantRoleLevel && (
              <Row>
                <Col span={8}>
                  <FormItem label={intl.get(`${modelPrompt}.level`).d('层级')} {...formLayout}>
                    {getFieldDecorator('level')(
                      <Select allowClear>
                        {levelCodeList.map(n => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.onReset.bind(this)}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
