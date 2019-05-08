/*
 * DetailFilter - 熔断设置详情表单
 * @date: 2018/09/11 10:44:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Col, Row, Select } from 'hzero-ui';
import { map } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const promptCode = 'hsgp.hystrix';
const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class DetailFilter extends PureComponent {
  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields((err, values) => {
        onFilterChange(values);
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      propertyNameList,
    } = this.props;
    return (
      <Form layout="inline">
        <Row gutter={24}>
          <Col span={18} style={{ padding: 0 }}>
            <Form.Item
              label={intl.get(`${promptCode}.model.hystrix.propertyName`).d(`参数代码`)}
              {...formItemLayout}
              style={{ margin: 0, width: '100%' }}
            >
              {getFieldDecorator('propertyName')(
                <Select style={{ width: '100%' }} onChange={this.setRemark} allowClear>
                  {map(propertyNameList, e => {
                    return (
                      <Option value={e.value} key={e.value}>
                        {e.value}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={6} className="search-btn-more" style={{ padding: 0, marginLeft: '-47px' }}>
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
